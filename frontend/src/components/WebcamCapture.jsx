import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw, Check, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WebcamCapture = ({ onCapture, isLive = false, paused = false }) => {
    const webcamRef = useRef(null);
    const onCaptureRef = useRef(onCapture);
    const [imageSrc, setImageSrc] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    // Keep onCaptureRef current
    React.useEffect(() => {
        onCaptureRef.current = onCapture;
    }, [onCapture]);

    // Auto-capture for live mode
    React.useEffect(() => {
        let interval;
        if (isLive && !paused && !imageSrc) {
            setIsScanning(true);
            interval = setInterval(() => {
                if (webcamRef.current) {
                    const imageSrc = webcamRef.current.getScreenshot();
                    if (imageSrc) {
                        fetch(imageSrc)
                            .then(res => res.blob())
                            .then(blob => {
                                const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                                if (onCaptureRef.current) {
                                    onCaptureRef.current(file);
                                }
                            });
                    }
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isLive, imageSrc, paused]);

    const capture = () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                if (onCaptureRef.current) onCaptureRef.current(file);
            });
    };

    const retake = () => {
        setImageSrc(null);
        if (!isLive && onCaptureRef.current) onCaptureRef.current(null);
    };

    return (
        <div className="space-y-4">
            <motion.div
                layout
                className="relative rounded-3xl overflow-hidden shadow-2xl bg-black/40 border border-white/10 group"
            >
                {/* 
                    Changed from aspect-video (16:9) to aspect-[4/3] for taller display
                    Increased max-height to make camera more prominent
                */}
                <div className="relative aspect-[4/3] w-full max-h-[80vh] md:max-h-[750px] overflow-hidden">
                    {/* Scan Frame Overlay */}
                    {!imageSrc && (
                        <div className="absolute inset-0 z-10 pointer-events-none">
                            {/* Premium Corner Accents */}
                            <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl opacity-60"></div>
                            <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-cyan-400 rounded-tr-2xl opacity-60"></div>
                            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-cyan-400 rounded-bl-2xl opacity-60"></div>
                            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl opacity-60"></div>

                            {/* Scanning Animation */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0], top: ['10%', '90%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                            />

                            {/* Center Face Guide - Hidden on tiny screens to save space */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
                                <div className="w-48 h-64 rounded-[3rem] border-2 border-white/10 relative">
                                    <div className="absolute inset-0 border-2 border-white/20 rounded-[3rem] scale-105 opacity-50"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {imageSrc && !isLive ? (
                        <motion.img
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={imageSrc}
                            alt="Captured"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                            videoConstraints={{
                                facingMode: "user"
                            }}
                            playsInline={true}
                        />
                    )}
                </div>

                {/* Status Badge - Floating */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-max max-w-[90%]">
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md border shadow-lg ${imageSrc && !isLive
                        ? 'bg-emerald-500/20 border-emerald-500/30'
                        : 'bg-black/40 border-white/10'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${imageSrc && !isLive ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'
                            }`}></div>
                        <span className={`text-xs sm:text-sm font-semibold tracking-wide ${imageSrc && !isLive ? 'text-emerald-400' : 'text-cyan-400'
                            }`}>
                            {isLive ? 'LIVE SCANNING' : (imageSrc ? 'CAPTURED' : 'FACE CAMERA')}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons - Only show if NOT live mode */}
            {!isLive && (
                <AnimatePresence mode="wait">
                    {imageSrc ? (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onClick={retake}
                            className="w-full py-4 text-white/80 hover:text-white font-medium flex items-center justify-center gap-2 transition-colors group"
                        >
                            <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
                            Retake Photo
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={capture}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                        >
                            <Camera size={20} />
                            Capture Photo
                        </motion.button>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default WebcamCapture;
