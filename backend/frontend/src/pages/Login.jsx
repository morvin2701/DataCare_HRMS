import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Shield, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../config';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Find user by email
            const response = await axios.get(`${config.API_URL}/users`);
            const user = response.data.find(u => u.email === email);

            if (!user) {
                setError('User not found. Please register first.');
                setLoading(false);
                return;
            }

            // Login successful
            login(user);

            // Redirect based on role
            setTimeout(() => {
                const PERMANENT_ADMINS = ['morvin27@gmail.com', 'vekariyamorvin@gmail.com'];

                if (user.role === 'admin' || PERMANENT_ADMINS.includes(user.email)) {
                    navigate('/admin');
                } else if (user.role === 'manager') {
                    navigate('/manager');
                } else {
                    navigate('/employee');
                }
            }, 500);
        } catch (err) {
            setError('Login failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative"
            >
                {/* Decorative Elements */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 rounded-full blur-2xl"></div>

                {/* Logo & Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-10"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="inline-block mb-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
                                <Shield className="text-white" size={40} />
                            </div>
                        </div>
                    </motion.div>

                    <h1 className="text-6xl font-black mb-3">
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Welcome Back
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg flex items-center justify-center gap-2">
                        <Sparkles size={18} className="text-yellow-400 animate-pulse" />
                        Login to access your HRMS dashboard
                    </p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel p-10 relative overflow-hidden"
                >
                    {/* Animated Border */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-xl"></div>

                    <div className="relative">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                    <Mail size={18} className="text-blue-400" />
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        className="input-field pr-12 group-hover:border-blue-500/50 transition-all duration-300"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors" size={20} />
                                </div>
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/30 rounded-2xl flex items-center gap-3"
                                    >
                                        <AlertCircle className="text-red-400" size={24} />
                                        <p className="text-red-400 font-semibold">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Login Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-5 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 shimmer"></div>
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span className="font-bold">Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={24} />
                                        <span className="font-bold">Login to Dashboard</span>
                                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Register Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 text-center"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-slate-900/50 text-slate-400">Don't have an account?</span>
                                </div>
                            </div>

                            <motion.button
                                onClick={() => navigate('/register')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-6 w-full px-6 py-4 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-blue-500/30 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={20} className="text-blue-400" />
                                Register New Account
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Bottom Accent */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                        <Shield size={14} />
                        Secured with AI Face Recognition Technology
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
