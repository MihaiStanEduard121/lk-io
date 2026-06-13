import React from 'react';
import { motion } from 'motion/react';

interface UploadProgressBarProps {
  progress: number; // 0 to 100
  isUploading: boolean;
  estimatedTimeSeconds?: number;
}

export default function UploadProgressBar({ progress, isUploading, estimatedTimeSeconds }: UploadProgressBarProps) {
  if (!isUploading) return null;

  return (
    <div className="w-full space-y-2 py-4">
      <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
        <span>Încărcare...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'tween', ease: 'linear' }}
        />
      </div>
      {estimatedTimeSeconds !== undefined && estimatedTimeSeconds > 0 && (
        <div className="text-[10px] text-zinc-500 font-mono text-right">
          ~{Math.round(estimatedTimeSeconds)} secunde rămase
        </div>
      )}
    </div>
  );
}
