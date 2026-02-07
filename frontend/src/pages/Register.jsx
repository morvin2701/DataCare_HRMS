import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import WebcamCapture from '../components/WebcamCapture';
import { UserPlus, Mail, Briefcase, User, CheckCircle, AlertCircle, Sparkles, Shield, ArrowRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
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
            formData.append('role', finalRole);
            formData.append('file', capturedImage);

            // Register user
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
                    // Assuming backend returns created user or we mock it for immediate login
                    // If backend returns the user object, better to use that.
                    // For now, let's just use the data we have.
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
                text: error.response?.data?.detail || 'Registration failed. Please try again.'
            });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-6 relative overflow-hidden flex flex-col justify-center">
            {/* Background Elements */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center gap-3 mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <UserPlus className="text-white" size={32} />
                        </div>
                    </div>
                </div>
                <h1 className="text-5xl font-black mb-3">
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Create Account
                    </span>
                </h1>
                <p className="text-slate-400 text-lg flex items-center justify-center gap-2">
                    <Sparkles size={18} className="text-yellow-400" />
                    Join DataCare HRMS Team
                </p>
            </motion.div>

            <div className="max-w-5xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left: Webcam Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel p-8 relative overflow-hidden h-full"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Camera size={120} />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                            Face ID Setup
                        </h3>
                        <p className="text-slate-400 mb-6 text-sm">
                            We use AI face recognition for secure attendance marking. Please align your face in the frame.
                        </p>

                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800/50">
                            <WebcamCapture onCapture={setCapturedImage} />
                        </div>

                        <div className="mt-6 flex items-center gap-3 text-sm text-slate-400 bg-slate-800/50 p-4 rounded-xl">
                            <Shield size={16} className="text-green-400" />
                            <span>Your biometric data is encrypted and stored securely.</span>
                        </div>
                    </motion.div>

                    {/* Right: Registration Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel p-8 relative"
                    >
                        {/* Form Header */}
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-1">Personal Details</h3>
                            <p className="text-slate-400 text-sm">Fill in your information to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                    <User size={16} className="text-blue-400" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                    <Mail size={16} className="text-blue-400" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="john@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                    <Briefcase size={16} className="text-blue-400" />
                                    Select Role
                                </label>
                                <div className="relative">
                                    <select
                                        className="input-field appearance-none cursor-pointer"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
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
                                className="btn-primary w-full flex items-center justify-center gap-3 mt-4 group"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <span className="font-bold">Complete Registration</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <p className="text-slate-400 text-sm">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
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
                                    className={`absolute left-0 right-0 -bottom-20 mx-8 p-4 rounded-xl flex items-center gap-3 shadow-lg backdrop-blur-md ${message.type === 'success'
                                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                                        : 'bg-red-500/20 border border-red-500/30 text-red-400'
                                        }`}
                                >
                                    {message.type === 'success' ? (
                                        <CheckCircle size={24} />
                                    ) : (
                                        <AlertCircle size={24} />
                                    )}
                                    <span className="font-semibold">{message.text}</span>
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
