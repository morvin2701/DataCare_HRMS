import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import { Users, Clock, TrendingUp, Activity, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalHours: 0, daysPresent: 0, currentStatus: 'Absent' });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        if (user) {
            fetchData();
            const interval = setInterval(fetchData, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/attendance`);
            const myAttendance = response.data.filter(r => r.user_id === user.id);

            // Calculate stats
            const today = new Date().toDateString();
            const todayRecords = myAttendance.filter(r => new Date(r.timestamp).toDateString() === today);
            const isPresent = todayRecords.length > 0;
            const lastRecord = todayRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

            // Calculate total hours (simplified)
            // In a real app, pair IN/OUT records properly
            const daysPresent = new Set(myAttendance.map(r => new Date(r.timestamp).toDateString())).size;

            setStats({
                totalHours: 0, // Placeholder
                daysPresent: daysPresent,
                currentStatus: isPresent ? (lastRecord.type === 'IN' ? 'Checked In' : 'Checked Out') : 'Absent'
            });

            setRecentActivity(myAttendance.slice(0, 10)); // Top 10 recent
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const StatCard = ({ title, value, icon: Icon, gradient, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-panel p-8 card-hover group"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={28} />
                </div>
                <Activity className="text-slate-400" size={24} />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
            <h3 className="text-4xl font-black text-white">
                {value}
            </h3>
        </motion.div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                    My Dashboard
                </h1>
                <p className="text-slate-400 text-lg">Welcome back, {user?.name}</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Current Status"
                    value={stats.currentStatus}
                    icon={CheckCircle2}
                    gradient={stats.currentStatus === 'Checked In' ? "from-green-500 to-emerald-600" : "from-slate-500 to-slate-600"}
                    delay={0.1}
                />
                <StatCard
                    title="Days Present"
                    value={stats.daysPresent}
                    icon={Calendar}
                    gradient="from-blue-500 to-indigo-600"
                    delay={0.2}
                />
                <StatCard
                    title="Total Work Hours"
                    value={`${stats.totalHours} hrs`} // Placeholder
                    icon={Clock}
                    gradient="from-purple-500 to-pink-600"
                    delay={0.3}
                />
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel p-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">
                        My Attendance History
                    </h3>
                </div>

                <div className="space-y-3">
                    {recentActivity.map((record, index) => (
                        <motion.div
                            key={record.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 group border border-white/5 hover:border-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${record.type === 'IN' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-orange-600'
                                    }`}>
                                    {record.type === 'IN' ? <Clock size={20} /> : <LogOut size={20} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">
                                        {record.type === 'IN' ? 'Punch In' : 'Punch Out'}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        {new Date(record.timestamp).toDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-mono text-lg font-bold">
                                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    {recentActivity.length === 0 && (
                        <div className="py-16 text-center">
                            <Activity className="mx-auto mb-4 text-slate-600" size={48} />
                            <p className="text-slate-500 text-lg">No attendance records found</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default EmployeeDashboard;
