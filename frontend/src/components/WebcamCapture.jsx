import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw, Check, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WebcamCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);

        // Convert base64 to blob for upload
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                onCapture(file);
            });
    };

    const retake = () => {
        setImageSrc(null);
        onCapture(null);
    };

    return (
        <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                {/* Scan Frame Overlay */}
                {!imageSrc && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {/* Corner Brackets */}
                        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl"></div>
                        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl"></div>
                        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl"></div>
                        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-blue-400 rounded-br-2xl"></div>

                        {/* Scanning Line */}
                        <motion.div
                            animate={{ y: ['0%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-lg shadow-blue-400/50"
                        />

                        {/* Center Face Icon */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-32 h-32 rounded-full border-4 border-blue-400/30 flex items-center justify-center"
                            >
                                <ScanFace className="text-blue-400" size={48} />
                            </motion.div>
                        </div>
                    </div>
                )}

                {imageSrc ? (
                    <motion.img
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={imageSrc}
                        alt="Captured"
                        className="w-full h-auto"
                    />
                ) : (
                    <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-auto"
                        videoConstraints={{
                            width: 1280,
                            height: 720,
                            facingMode: "user"
                        }}
                    />
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className={`px-6 py-2 rounded-full flex items-center gap-2 backdrop-blur-xl ${imageSrc
                            ? 'bg-green-500/20 border-2 border-green-400'
                            : 'bg-blue-500/20 border-2 border-blue-400'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${imageSrc ? 'bg-green-400' : 'bg-blue-400 animate-pulse'
                            }`}></div>
                        <span className={`text-sm font-bold ${imageSrc ? 'text-green-400' : 'text-blue-400'
                            }`}>
                            {imageSrc ? 'Image Captured' : 'Position Your Face'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <AnimatePresence mode="wait">
                {imageSrc ? (
                    <motion.button
                        key="retake"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={retake}
                        className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <RotateCcw size={20} />
                        Retake Photo
                    </motion.button>
                ) : (
                    <motion.button
                        key="capture"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={capture}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/50 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 shimmer"></div>
                        <Camera size={20} />
                        Capture Face
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WebcamCapture;
