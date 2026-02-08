import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import axios from 'axios';
import {
    Users, Trash2, Edit, Shield, TrendingUp, Activity, UserCheck,
    Search, LogOut, XCircle, Download, Calendar, Filter, ChevronLeft, ChevronRight, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

const AdminPanel = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    // Data States
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [allAttendance, setAllAttendance] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'attendance'

    // Filtering & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modals
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Available Departments (Derived from stats or hardcoded default)
    const [departments, setDepartments] = useState(['General', 'HR', 'IT', 'Sales', 'Marketing', 'Operations']);

    useEffect(() => {
        if (!isAdmin()) {
            navigate('/');
        } else {
            fetchData();
        }
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, statsRes, attendanceRes] = await Promise.all([
                axios.get(`${config.API_URL}/users`),
                axios.get(`${config.API_URL}/stats`),
                axios.get(`${config.API_URL}/attendance`)
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
            setAllAttendance(attendanceRes.data);

            // Extract unique departments from API stats if available, else merge with defaults
            if (statsRes.data.users_by_department) {
                const apiDepts = Object.keys(statsRes.data.users_by_department);
                setDepartments(prev => Array.from(new Set([...prev, ...apiDepts])));
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    // --- Computed Data ---

    // Filtered Users
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const matchesDept = deptFilter === 'all' || (u.department || 'General') === deptFilter;
        return matchesSearch && matchesRole && matchesDept;
    });

    // Filtered Attendance
    const filteredAttendance = allAttendance.filter(record => {
        const user = users.find(u => u.id === record.user_id);
        const userName = user ? user.name.toLowerCase() : 'unknown';
        const matchesSearch = userName.includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (dateRange.start && dateRange.end) {
            matchesDate = isWithinInterval(parseISO(record.timestamp), {
                start: startOfDay(parseISO(dateRange.start)),
                end: endOfDay(parseISO(dateRange.end))
            });
        } else if (dateRange.start) {
            matchesDate = isSameDay(parseISO(record.timestamp), parseISO(dateRange.start));
        }

        const matchesDept = deptFilter === 'all' || (user?.department || 'General') === deptFilter;

        return matchesSearch && matchesDate && matchesDept;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination Logic
    const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
    const paginatedAttendance = filteredAttendance.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- Actions ---

    const handleUpdateUser = async (userId, field, value) => {
        try {
            const formData = new FormData();
            formData.append(field, value);
            await axios.put(`${config.API_URL}/users/${userId}`, formData);
            fetchData();
        } catch (error) {
            alert(`Failed to update ${field}`);
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Time', 'User ID', 'Name', 'Role', 'Department', 'Type'];
        const rows = filteredAttendance.map(record => {
            const user = users.find(u => u.id === record.user_id);
            const date = new Date(record.timestamp);
            return [
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                record.user_id,
                user ? user.name : 'Unknown',
                user ? user.role : 'Unknown',
                user ? (user.department || 'General') : 'Unknown',
                record.type
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
        <div className="space-y-8 relative pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-400 text-lg flex items-center gap-2">
                        <Shield size={18} className="text-blue-400" />
                        Welcome back, {user?.name}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Attendance Logs
                        </button>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold flex items-center gap-2"
                    >
                        <LogOut size={20} />
                        <span className="hidden md:inline">Logout</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Content Switcher */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
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
                        <div className="glass-panel p-6 md:p-8">
                            <div className="flex flex-col xl:flex-row md:items-center justify-between mb-6 gap-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Users size={24} className="text-indigo-400" />
                                    User Management
                                </h2>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
                                        />
                                    </div>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="employee">Employee</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <select
                                        value={deptFilter}
                                        onChange={(e) => setDeptFilter(e.target.value)}
                                        className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                    >
                                        <option value="all">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-4 text-slate-400 font-semibold">User</th>
                                            <th className="text-left py-4 px-4 text-slate-400 font-semibold">Email</th>
                                            <th className="text-left py-4 px-4 text-slate-400 font-semibold">Password</th>
                                            <th className="text-left py-4 px-4 text-slate-400 font-semibold">Role</th>
                                            <th className="text-left py-4 px-4 text-slate-400 font-semibold">Department</th>
                                            <th className="text-right py-4 px-4 text-slate-400 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-semibold">{u.name}</p>
                                                            <p className="text-xs text-slate-500">ID: {u.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-slate-300">{u.email}</td>
                                                <td className="py-4 px-4">
                                                    <span className="font-mono text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg border border-white/5">
                                                        {u.password || '123456'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {editingUser === u.id ? (
                                                        <select
                                                            defaultValue={u.role}
                                                            onChange={(e) => handleUpdateUser(u.id, 'role', e.target.value)}
                                                            className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                                                            autoFocus
                                                        >
                                                            <option value="employee">Employee</option>
                                                            <option value="manager">Manager</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${u.role === 'admin' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                                            u.role === 'manager' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                            }`}>
                                                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-slate-300">
                                                    {editingUser === u.id ? (
                                                        <input
                                                            list="dept-options"
                                                            defaultValue={u.department || 'General'}
                                                            onBlur={(e) => handleUpdateUser(u.id, 'department', e.target.value)}
                                                            className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm w-32"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Briefcase size={14} className="text-slate-500" />
                                                            <span>{u.department || 'General'}</span>
                                                        </div>
                                                    )}
                                                    <datalist id="dept-options">
                                                        {departments.map(d => <option key={d} value={d} />)}
                                                    </datalist>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingUser(editingUser === u.id ? null : u.id)}
                                                            className={`p-2 rounded-lg transition-colors border ${editingUser === u.id
                                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                                : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                                }`}
                                                            title={editingUser === u.id ? "Done Editing" : "Edit User"}
                                                        >
                                                            {editingUser === u.id ? <UserCheck size={16} /> : <Edit size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(u)}
                                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/30"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="attendance"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-panel p-6 md:p-8"
                    >
                        <div className="flex flex-col xl:flex-row md:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Activity size={24} className="text-emerald-400" />
                                    Attendance Logs
                                </h2>
                                <p className="text-slate-400 text-sm">View and export system-wide attendance records</p>
                            </div>

                            <div className="flex flex-wrap gap-3 items-center">
                                {/* Department Filter */}
                                <select
                                    value={deptFilter}
                                    onChange={(e) => setDeptFilter(e.target.value)}
                                    className="px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                >
                                    <option value="all">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>

                                {/* Date Range Filter */}
                                <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 py-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="bg-transparent text-white text-sm outline-none w-28 sm:w-32"
                                    />
                                    <span className="text-slate-500">-</span>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="bg-transparent text-white text-sm outline-none w-28 sm:w-32"
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={exportToCSV}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    <Download size={18} />
                                    <span className="hidden sm:inline">Export CSV</span>
                                </motion.button>
                            </div>
                        </div>

                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-slate-400 font-semibold">User</th>
                                        <th className="text-left py-4 px-4 text-slate-400 font-semibold">Date</th>
                                        <th className="text-left py-4 px-4 text-slate-400 font-semibold">Time</th>
                                        <th className="text-left py-4 px-4 text-slate-400 font-semibold">Type</th>
                                        <th className="text-left py-4 px-4 text-slate-400 font-semibold">Role</th>
                                        <th className="text-left py-4 px-4 text-slate-400 font-semibold">Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedAttendance.map((record, index) => {
                                        const user = users.find(u => u.id === record.user_id);
                                        return (
                                            <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                                            {user ? user.name.charAt(0) : '?'}
                                                        </div>
                                                        <span className="text-white font-medium">{user ? user.name : 'Unknown User'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-slate-300">
                                                    {format(parseISO(record.timestamp), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="py-4 px-4 text-slate-300 font-mono">
                                                    {format(parseISO(record.timestamp), 'HH:mm:ss')}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${record.type === 'IN'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                                        }`}>
                                                        {record.type}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                                                        {user ? user.role : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-sm text-slate-300">
                                                        {user ? (user.department || 'General') : 'General'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredAttendance.length === 0 && (
                                <div className="text-center py-12 text-slate-500">
                                    No attendance records found for the selected filters.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                            <p className="text-slate-400 text-sm">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAttendance.length)} of {filteredAttendance.length} entries
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#1a1f3c] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
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
        </div>
    );
};

export default AdminPanel;
