import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Shield, Sparkles, ArrowRight, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../config';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

            // Validate password
            if (user.password !== password) {
                setError('Incorrect password. Please try again.');
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
            }, 800);
        } catch (err) {
            setError('Login failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Column: Branding & Info (Hidden on mobile, visible on lg) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex flex-col justify-center h-full p-12 relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[3rem] blur-3xl -z-10"></div>

                    <div className="mb-8 relative">
                        <div className="absolute -left-4 -top-4 w-20 h-20 bg-blue-500/30 rounded-full blur-xl"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8 border border-white/10">
                            <Shield className="text-white transform scale-110" size={48} />
                        </div>
                    </div>

                    <h1 className="text-6xl font-black text-white mb-6 leading-tight">
                        Welcome to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                            DataCare HRMS
                        </span>
                    </h1>

                    <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-lg">
                        Securely access your dashboard, track attendance, and manage your profile with our advanced AI-powered platform.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                            <Sparkles className="text-yellow-400 mb-3" size={32} />
                            <h3 className="text-white font-bold text-lg mb-1">AI Powered</h3>
                            <p className="text-slate-400 text-sm">Smart face recognition logic</p>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                            <Lock className="text-emerald-400 mb-3" size={32} />
                            <h3 className="text-white font-bold text-lg mb-1">Secure</h3>
                            <p className="text-slate-400 text-sm">Enterprise-grade security</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Login Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md mx-auto"
                >
                    <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl">
                        {/* Mobile Logo (Visible only on small screens) */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                                <Shield className="text-white" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                            <p className="text-slate-400 text-sm">Sign in to continue</p>
                        </div>

                        <div className="hidden lg:block mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                            <p className="text-slate-400">Access your employee dashboard</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 ml-1">
                                    <Mail size={16} className="text-blue-400" />
                                    Work Email
                                </label>
                                <div className="group relative">
                                    <input
                                        type="email"
                                        className="w-full bg-black/20 border border-white/10 text-white px-5 py-4 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 group-hover:bg-black/30"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                        <div className={`w-2 h-2 rounded-full ${email ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 ml-1">
                                    <Lock size={16} className="text-blue-400" />
                                    Password
                                </label>
                                <div className="group relative">
                                    <input
                                        type="password"
                                        className="w-full bg-black/20 border border-white/10 text-white px-5 py-4 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 group-hover:bg-black/30"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                        <div className={`w-2 h-2 rounded-full ${password ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 overflow-hidden"
                                    >
                                        <AlertCircle className="text-rose-400 shrink-0" size={20} />
                                        <p className="text-rose-300 text-sm font-medium">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all relative overflow-hidden group mt-2"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Login to Dashboard</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <p className="text-slate-400 text-sm">
                                New to DataCare?{' '}
                                <button
                                    onClick={() => navigate('/register')}
                                    className="text-white hover:text-blue-300 font-bold transition-colors inline-flex items-center gap-1 ml-1 group"
                                >
                                    Create Account
                                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
