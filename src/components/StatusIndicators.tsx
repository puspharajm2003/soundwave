import React from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isOnline: boolean;
  downloadCount: number;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isOnline, 
  downloadCount 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4"
    >
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
        isOnline 
          ? "bg-primary/20 text-primary" 
          : "bg-muted text-muted-foreground"
      )}>
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </>
        )}
      </div>
      
      {downloadCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
          <Download className="w-3 h-3" />
          <span>{downloadCount} downloaded</span>
        </div>
      )}
    </motion.div>
  );
};

interface DownloadProgressProps {
  progress: number;
  songTitle: string;
  isComplete: boolean;
}

export const DownloadProgress: React.FC<DownloadProgressProps> = ({
  progress,
  songTitle,
  isComplete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-4 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {isComplete ? (
            <div className="p-2 rounded-full bg-primary/20">
              <Check className="w-4 h-4 text-primary" />
            </div>
          ) : (
            <div className="p-2 rounded-full bg-muted">
              <Download className="w-4 h-4 text-muted-foreground animate-bounce" />
            </div>
          )}
          <div>
            <p className="font-medium text-sm">{songTitle}</p>
            <p className="text-xs text-muted-foreground">
              {isComplete ? "Download complete" : `Downloading... ${Math.round(progress)}%`}
            </p>
          </div>
        </div>
      </div>
      
      {!isComplete && (
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </motion.div>
  );
};
