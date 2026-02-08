import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import axios from 'axios';
import { Users, Trash2, Edit, Shield, TrendingUp, Activity, UserCheck, Search, LogOut, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [userAttendance, setUserAttendance] = useState([]);

    useEffect(() => {
        if (!isAdmin()) {
            navigate('/');
        } else {
            fetchData();
        }
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                axios.get(`${config.API_URL}/users`),
                axios.get(`${config.API_URL}/stats`)
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const fetchUserAttendance = async (userId) => {
        try {
            const res = await axios.get(`${config.API_URL}/attendance`);
            // Filter client side for now as API returns all (should optimize later)
            const userRecords = res.data.filter(r => r.user_id === userId);
            setUserAttendance(userRecords);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            const formData = new FormData();
            formData.append('role', newRole);
            await axios.put(`${config.API_URL}/users/${userId}`, formData);
            setEditingUser(null);
            fetchData();
        } catch (error) {
            alert('Failed to update role');
        }
    };

    const confirmDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const executeDelete = async () => {
        if (!selectedUser) return;
        try {
            await axios.delete(`${config.API_URL}/users/${selectedUser.id}`);
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchData();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const viewDetails = (user) => {
        setSelectedUser(user);
        fetchUserAttendance(user.id);
        setShowDetailModal(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, gradient }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 card-hover"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                </div>
                <TrendingUp className="text-green-400" size={20} />
            </div>
            <p className="text-slate-400 text-sm mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white">{value}</h3>
        </motion.div>
    );

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Admin Panel
                    </h1>
                    <p className="text-slate-400 text-lg flex items-center gap-2">
                        <Shield size={18} />
                        Welcome back, {user?.name}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white font-bold rounded-2xl shadow-xl flex items-center gap-2"
                >
                    <LogOut size={20} />
                    Logout
                </motion.button>
            </motion.div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard title="Total Users" value={stats.total_users} icon={Users} gradient="from-blue-500 to-indigo-600" />
                    <StatCard title="Admins" value={stats.users_by_role.admin} icon={Shield} gradient="from-red-500 to-pink-600" />
                    <StatCard title="Managers" value={stats.users_by_role.manager} icon={UserCheck} gradient="from-purple-500 to-indigo-600" />
                    <StatCard title="Employees" value={stats.users_by_role.employee} icon={Activity} gradient="from-green-500 to-emerald-600" />
                </div>
            )}

            {/* User Management */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users size={24} />
                        User Management
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-4 px-4 text-slate-400 font-semibold">ID</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-semibold">Name</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-semibold">Email</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-semibold">Role</th>
                                <th className="text-right py-4 px-4 text-slate-400 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredUsers.map((u) => (
                                    <motion.tr
                                        key={u.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <span className="text-slate-400 font-mono">#{u.id.toString().padStart(3, '0')}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <span className="text-white font-semibold">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-300">{u.email}</td>
                                        <td className="py-4 px-4">
                                            {editingUser === u.id ? (
                                                <select
                                                    defaultValue={u.role}
                                                    onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                    className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                                                    autoFocus
                                                >
                                                    <option value="employee">Employee</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${u.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                    u.role === 'manager' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                        'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    }`}>
                                                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => viewDetails(u)}
                                                    className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                                                    title="View Activity"
                                                >
                                                    <Activity size={16} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setEditingUser(editingUser === u.id ? null : u.id)}
                                                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                                                    title="Edit Role"
                                                >
                                                    <Edit size={16} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => confirmDelete(u)}
                                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="py-12 text-center">
                            <Users className="mx-auto mb-4 text-slate-600" size={48} />
                            <p className="text-slate-500">No users found</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Confirm Delete</h3>
                            <p className="text-slate-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-white">{selectedUser?.name}</span>? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Delete User
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {showDetailModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{selectedUser?.name}</h3>
                                    <p className="text-slate-400">{selectedUser?.email} • {selectedUser?.role}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2">
                                <h4 className="text-lg font-semibold text-white mb-4">Recent Attendance</h4>
                                {userAttendance.length > 0 ? (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10 text-left">
                                                <th className="py-2 text-slate-400">Date</th>
                                                <th className="py-2 text-slate-400">Time</th>
                                                <th className="py-2 text-slate-400">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userAttendance.slice(0, 10).map((record) => (
                                                <tr key={record.id} className="border-b border-white/5">
                                                    <td className="py-3 text-slate-300">{new Date(record.timestamp).toLocaleDateString()}</td>
                                                    <td className="py-3 text-slate-300 font-mono">{new Date(record.timestamp).toLocaleTimeString()}</td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${record.type === 'IN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {record.type}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-slate-500 text-center py-8">No attendance records found.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;
