import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import WebcamCapture from '../components/WebcamCapture';
import { UserPlus, Mail, Briefcase, User, CheckCircle, AlertCircle, Sparkles, Shield, ArrowRight, Camera, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!capturedImage) {
            setMessage({ type: 'error', text: 'Please capture a face status image first!' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Check for permanent admin emails
            const PERMANENT_ADMINS = ['morvin27@gmail.com', 'vekariyamorvin@gmail.com'];
            let finalRole = role;
            if (PERMANENT_ADMINS.includes(email)) {
                finalRole = 'admin';
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', finalRole);
            formData.append('file', capturedImage);

            // Register user
            const response = await axios.post(`${config.API_URL}/register`, formData);

            // If successful, log them in automatically
            if (response.status === 200 || response.status === 201) {
                setMessage({ type: 'success', text: `Welcome ${name}! Registration successful.` });

                // Construct user object (matching backend response roughly)
                const newUser = {
                    name,
                    email,
                    role: finalRole,
                };

                login(newUser);

                // Redirect based on role
                setTimeout(() => {
                    if (finalRole === 'admin') navigate('/admin');
                    else if (finalRole === 'manager') navigate('/manager');
                    else navigate('/employee');
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || error.message || 'Registration failed. Please try again.'
            });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 relative overflow-hidden flex flex-col justify-center">
            {/* Background Elements */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center gap-3 mb-6 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-16 h-16 bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-xl">
                        <UserPlus className="text-blue-400 group-hover:scale-110 transition-transform duration-300" size={32} />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-3">
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
                        Create Account
                    </span>
                </h1>
                <p className="text-slate-400 text-lg flex items-center justify-center gap-2">
                    <Sparkles size={18} className="text-yellow-400" />
                    Join DataCare HRMS Team
                </p>
            </motion.div>

            <div className="max-w-6xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left: Webcam Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel p-6 md:p-8 rounded-[2rem] relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Camera className="text-blue-400" size={24} />
                                </div>
                                Face ID Setup
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                AI-powered face recognition for secure attendance. Please position yourself clearly in the frame.
                            </p>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-grow">
                            <WebcamCapture onCapture={setCapturedImage} />
                        </div>

                        <div className="mt-6 flex items-center gap-3 text-sm text-slate-400 bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-md">
                            <Shield size={16} className="text-emerald-400 shrink-0" />
                            <span>Your biometric data is encrypted and stored securely.</span>
                        </div>
                    </motion.div>

                    {/* Right: Registration Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel p-6 md:p-8 rounded-[2rem] relative"
                    >
                        {/* Form Header */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Personal Details</h3>
                            <p className="text-slate-400 text-sm">Fill in your information to complete your profile</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 ml-1">
                                    <User size={16} className="text-indigo-400" />
                                    Full Name
                                </label>
                                <div className="group relative">
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/10 text-white px-5 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 group-hover:bg-black/30"
                                        placeholder="e.g. John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 ml-1">
                                    <Mail size={16} className="text-indigo-400" />
                                    Email Address
                                </label>
                                <div className="group relative">
                                    <input
                                        type="email"
                                        className="w-full bg-black/20 border border-white/10 text-white px-5 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 group-hover:bg-black/30"
                                        placeholder="john@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 ml-1">
                                    <Lock size={16} className="text-indigo-400" />
                                    Password
                                </label>
                                <div className="group relative">
                                    <input
                                        type="password"
                                        className="w-full bg-black/20 border border-white/10 text-white px-5 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 group-hover:bg-black/30"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 ml-1">
                                    <Briefcase size={16} className="text-indigo-400" />
                                    Select Role
                                </label>
                                <div className="relative group">
                                    <select
                                        className="w-full bg-black/20 border border-white/10 text-white px-5 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer group-hover:bg-black/30"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="employee" className="bg-slate-900">Employee</option>
                                        <option value="manager" className="bg-slate-900">Manager</option>
                                        <option value="admin" className="bg-slate-900">Admin</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all relative overflow-hidden group mt-6"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Complete Registration</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <p className="text-slate-400 text-sm">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                                >
                                    Login here
                                </button>
                            </p>
                        </div>

                        {/* Status Messages */}
                        <AnimatePresence>
                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`absolute left-0 right-0 -bottom-24 mx-4 p-4 rounded-2xl flex items-center gap-4 shadow-xl backdrop-blur-xl border ${message.type === 'success'
                                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100'
                                        : 'bg-rose-500/20 border-rose-500/30 text-rose-100'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}>
                                        {message.type === 'success' ? <CheckCircle size={20} className="text-white" /> : <AlertCircle size={20} className="text-white" />}
                                    </div>
                                    <p className="font-semibold text-sm pr-2">{message.text}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Register;
