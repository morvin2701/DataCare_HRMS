import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import WebcamCapture from '../components/WebcamCapture';
import { Camera, Clock, CheckCircle, XCircle, Loader, Zap, Sparkles, RefreshCcw, LogOut, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Attendance = () => {
    const [message, setMessage] = useState({ type: '', text: '', user: null });
    const [attendanceType, setAttendanceType] = useState('IN');
    const [lastProcessed, setLastProcessed] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const COOLDOWN_MS = 5000;

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleRecognition = React.useCallback(async (file) => {
        if (isPaused || Date.now() - lastProcessed < COOLDOWN_MS) return;

        try {
            const formData = new FormData();
            formData.append('type', attendanceType);
            formData.append('file', file);

            const response = await axios.post(`${config.API_URL}/recognize`, formData);

            setMessage({
                type: 'success',
                text: response.data.message,
                user: response.data.user
            });
            setLastProcessed(Date.now());
            setIsPaused(true);

        } catch (error) {
            console.log("Recognition attempt failed:", error.response?.data?.detail);
        }
    }, [isPaused, lastProcessed, attendanceType]);

    const handleModeChange = (type) => {
        setAttendanceType(type);
        setMessage({ type: '', text: '', user: null });
        setIsPaused(false);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-7xl w-full mx-auto relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 md:mb-12"
                >
                    <div className="inline-flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative w-20 h-20 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                            <Camera className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" size={40} />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-lg">
                            Attendance Tracking
                        </span>
                    </h1>

                    {/* Digital Clock Pill */}
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg mb-6">
                        <Clock size={18} className="text-cyan-400" />
                        <span className="font-mono text-xl md:text-2xl font-bold tracking-widest text-cyan-50 shadow-cyan-500/50">
                            {formatTime(currentTime)}
                        </span>
                    </div>

                    <p className="text-slate-400 text-sm md:text-base flex items-center justify-center gap-2">
                        <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                        AI-Powered Face Recognition System
                    </p>
                </motion.div>

                {/* Main Content Grid */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                    {/* Webcam Section - Takes more space on large screens */}
                    <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-1">
                        <div className="glass-panel rounded-[2.5rem] p-1 md:p-2 overflow-hidden shadow-2xl shadow-black/50">
                            <WebcamCapture onCapture={handleRecognition} isLive={true} paused={isPaused} />
                        </div>

                        {/* Status Bar below webcam on mobile */}
                        <div className="mt-6 flex justify-center lg:hidden">
                            <div className={`px-6 py-3 rounded-xl border flex items-center gap-3 transition-colors ${isPaused
                                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                }`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                                <span className="font-bold tracking-wide text-sm">
                                    {isPaused ? 'SYSTEM PAUSED' : 'SYSTEM ACTIVE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="lg:col-span-5 xl:col-span-4 order-2 lg:order-2 space-y-6">
                        {/* Status Card (Desktop only - hidden on mobile to save space) */}
                        <div className="hidden lg:flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                            <span className="text-slate-400 font-medium">Status</span>
                            <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 text-sm font-bold ${isPaused
                                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                                {isPaused ? 'PAUSED' : 'ACTIVE'}
                            </div>
                        </div>

                        {/* Mode Selection */}
                        <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] space-y-6">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Sparkles className="text-purple-400" size={20} />
                                Select Mode
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleModeChange('IN')}
                                    className={`relative group p-4 md:p-6 rounded-2xl border transition-all duration-300 ${attendanceType === 'IN'
                                            ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={`p-3 rounded-xl transition-colors ${attendanceType === 'IN' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-emerald-400'
                                            }`}>
                                            <LogIn size={24} />
                                        </div>
                                        <span className={`font-bold ${attendanceType === 'IN' ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            Punch In
                                        </span>
                                    </div>
                                    {attendanceType === 'IN' && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleModeChange('OUT')}
                                    className={`relative group p-4 md:p-6 rounded-2xl border transition-all duration-300 ${attendanceType === 'OUT'
                                            ? 'bg-rose-500/20 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={`p-3 rounded-xl transition-colors ${attendanceType === 'OUT' ? 'bg-rose-500 text-white' : 'bg-white/10 text-rose-400'
                                            }`}>
                                            <LogOut size={24} />
                                        </div>
                                        <span className={`font-bold ${attendanceType === 'OUT' ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            Punch Out
                                        </span>
                                    </div>
                                    {attendanceType === 'OUT' && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185]"></div>
                                    )}
                                </button>
                            </div>

                            {/* Manual Resume Button */}
                            <AnimatePresence>
                                {isPaused && (
                                    <motion.button
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        onClick={() => setIsPaused(false)}
                                        className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 group"
                                    >
                                        <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                        Resume Scanning
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notifications */}
                        <AnimatePresence mode="wait">
                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                    className={`p-6 rounded-3xl border backdrop-blur-xl relative overflow-hidden ${message.type === 'success'
                                            ? 'bg-emerald-500/10 border-emerald-500/20'
                                            : 'bg-rose-500/10 border-rose-500/20'
                                        }`}
                                >
                                    {/* Background Glow */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}></div>

                                    <div className="flex gap-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                            }`}>
                                            {message.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-lg ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                                                }`}>
                                                {message.type === 'success' ? 'Attendance Marked!' : 'Scan Failed'}
                                            </h4>
                                            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                                                {message.text}
                                            </p>

                                            {message.user && (
                                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {message.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">{message.user.name}</p>
                                                        <p className="text-indigo-300 text-xs font-medium uppercase tracking-wider">{message.user.role || 'Employee'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Attendance;
