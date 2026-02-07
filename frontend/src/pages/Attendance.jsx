import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import WebcamCapture from '../components/WebcamCapture';
import { Camera, Clock, CheckCircle, XCircle, Loader, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Attendance = () => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '', user: null });
    const [loading, setLoading] = useState(false);
    const [attendanceType, setAttendanceType] = useState('IN');

    const handleRecognition = async () => {
        if (!capturedImage) {
            setMessage({ type: 'error', text: 'Please capture an image first!', user: null });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('type', attendanceType);
            formData.append('file', capturedImage);

            const response = await axios.post(`${config.API_URL}/recognize`, formData);
            setMessage({
                type: 'success',
                text: response.data.message,
                user: response.data.user
            });
            setCapturedImage(null);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Recognition failed. Please try again.',
                user: null
            });
        }
        setLoading(false);

        setTimeout(() => setMessage({ type: '', text: '', user: null }), 5000);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50 animate-pulse">
                        <Camera className="text-white" size={32} />
                    </div>
                </div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                    Attendance Tracking
                </h1>
                <p className="text-slate-400 text-lg flex items-center justify-center gap-2">
                    <Zap size={18} className="text-yellow-400" />
                    Instant face recognition for attendance marking
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-10"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left: Webcam */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                Live Recognition
                            </h3>
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-red-400 text-sm font-semibold">RECORDING</span>
                            </div>
                        </div>
                        <WebcamCapture onCapture={setCapturedImage} />
                    </motion.div>

                    {/* Right: Controls */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                    >
                        <div>
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Clock size={20} />
                                Attendance Type
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setAttendanceType('IN')}
                                    className={`p-6 rounded-2xl font-bold text-lg transition-all duration-300 ${attendanceType === 'IN'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl shadow-green-500/50 scale-105'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-green-400/20 flex items-center justify-center">
                                            🟢
                                        </div>
                                        <span>Punch In</span>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setAttendanceType('OUT')}
                                    className={`p-6 rounded-2xl font-bold text-lg transition-all duration-300 ${attendanceType === 'OUT'
                                        ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-2xl shadow-red-500/50 scale-105'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-red-400/20 flex items-center justify-center">
                                            🔴
                                        </div>
                                        <span>Punch Out</span>
                                    </div>
                                </motion.button>
                            </div>

                            <motion.button
                                onClick={handleRecognition}
                                disabled={loading || !capturedImage}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-5"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin" size={24} />
                                        Recognizing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={24} />
                                        Mark Attendance
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Status Messages */}
                        <AnimatePresence>
                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                    className={`p-6 rounded-2xl ${message.type === 'success'
                                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/30'
                                        : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/30'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${message.type === 'success' ? 'bg-green-500/30' : 'bg-red-500/30'
                                            }`}>
                                            {message.type === 'success' ? (
                                                <CheckCircle className="text-green-400" size={24} />
                                            ) : (
                                                <XCircle className="text-red-400" size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-bold text-lg mb-1 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {message.type === 'success' ? 'Success!' : 'Error'}
                                            </p>
                                            <p className="text-white font-semibold">{message.text}</p>
                                            {message.user && (
                                                <div className="mt-3 p-3 bg-white/5 rounded-xl">
                                                    <p className="text-sm text-slate-400">Employee Details</p>
                                                    <p className="text-white font-bold">{message.user.name}</p>
                                                    <p className="text-slate-400 text-sm">{message.user.role}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Attendance;
