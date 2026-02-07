import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import axios from 'axios';
import { Users, Clock, TrendingUp, Activity, Calendar, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManagerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [teamStats, setTeamStats] = useState({ totalMembers: 0, presentToday: 0, absentToday: 0 });
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'manager' && user?.role !== 'admin') {
            navigate('/');
        } else {
            fetchData();
        }
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            // In a real app, we would fetch only team members
            // For now, we fetch all users and filter by 'employee' role to simulate team view
            const [usersRes, attendanceRes] = await Promise.all([
                axios.get(`${config.API_URL}/users`),
                axios.get(`${config.API_URL}/attendance`)
            ]);

            const employees = usersRes.data.filter(u => u.role === 'employee');
            const today = new Date().toDateString();

            // Filter attendance for today
            const todayAttendance = attendanceRes.data.filter(r =>
                new Date(r.timestamp).toDateString() === today
            );

            // Get unique employees present today
            const presentEmployeeIds = new Set(todayAttendance.map(r => r.user_id));

            setTeamStats({
                totalMembers: employees.length,
                presentToday: presentEmployeeIds.size,
                absentToday: employees.length - presentEmployeeIds.size
            });

            // Combine user data with their latest attendance
            const records = employees.map(emp => {
                const empAttendance = todayAttendance
                    .filter(r => r.user_id === emp.id)
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                return {
                    ...emp,
                    status: empAttendance.length > 0 ? 'Present' : 'Absent',
                    lastActive: empAttendance.length > 0 ? empAttendance[0].timestamp : null,
                    checkIn: empAttendance.find(r => r.type === 'IN')?.timestamp,
                    checkOut: empAttendance.find(r => r.type === 'OUT')?.timestamp
                };
            });

            setAttendanceRecords(records);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredRecords = attendanceRecords.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, gradient, subtitle }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 card-hover"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                </div>
                <Activity className="text-slate-400" size={20} />
            </div>
            <p className="text-slate-400 text-sm mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white">{value}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
        </motion.div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
                        Manager Dashboard
                    </h1>
                    <p className="text-slate-400 text-lg flex items-center gap-2">
                        <Users size={18} />
                        Team Overview & Attendance
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm text-slate-400">Current Date</p>
                        <p className="text-lg font-bold text-white">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl flex items-center gap-2"
                    >
                        Sign Out
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Team Members"
                    value={teamStats.totalMembers}
                    icon={Users}
                    gradient="from-purple-500 to-indigo-600"
                    subtitle="Active Employees"
                />
                <StatCard
                    title="Present Today"
                    value={teamStats.presentToday}
                    icon={CheckCircle2}
                    gradient="from-green-500 to-emerald-600"
                    subtitle={`${Math.round((teamStats.presentToday / teamStats.totalMembers) * 100 || 0)}% Attendance Rate`}
                />
                <StatCard
                    title="Absent Today"
                    value={teamStats.absentToday}
                    icon={XCircle}
                    gradient="from-red-500 to-pink-600"
                    subtitle="Requires Follow-up"
                />
            </div>

            {/* Team Attendance Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-8"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calendar size={24} />
                        Today's Attendance
                    </h2>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search member..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 outline-none w-64"
                            />
                        </div>
                        <button className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-4 px-4 text-slate-400 font-semibold">Employee</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-semibold">Status</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-semibold">Check In</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-semibold">Check Out</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-semibold">Total Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredRecords.map((record, index) => (
                                    <motion.tr
                                        key={record.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                    {record.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{record.name}</p>
                                                    <p className="text-xs text-slate-400">{record.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2 w-fit ${record.status === 'Present'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {record.status === 'Present' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-300 font-mono">
                                            {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="py-4 px-4 text-slate-300 font-mono">
                                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="py-4 px-4 text-slate-300 font-mono">
                                            {record.checkIn && record.checkOut ?
                                                ((new Date(record.checkOut) - new Date(record.checkIn)) / (1000 * 60 * 60)).toFixed(1) + ' hrs'
                                                : record.checkIn ? 'Active' : '-'}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredRecords.length === 0 && (
                        <div className="py-12 text-center">
                            <Users className="mx-auto mb-4 text-slate-600" size={48} />
                            <p className="text-slate-500">No team members found</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ManagerDashboard;
