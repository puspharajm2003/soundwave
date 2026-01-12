import React from "react";
import { motion } from "framer-motion";
import {
  Download,
  HardDrive,
  Wifi,
  WifiOff,
  Trash2,
  Pause,
  Play,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DownloadManagerProps {
  queue: Array<{
    songId: string;
    songTitle: string;
    artist: string;
    thumbnail: string;
    status: "pending" | "downloading" | "completed" | "failed";
    progress: number;
  }>;
  onPause: (songId: string) => void;
  onResume: (songId: string) => void;
  onCancel: (songId: string) => void;
  onRetry: (songId: string) => void;
}

export const DownloadManager: React.FC<DownloadManagerProps> = ({
  queue,
  onPause,
  onResume,
  onCancel,
  onRetry,
}) => {
  const activeDownloads = queue.filter((d) => d.status === "downloading");
  const pendingDownloads = queue.filter((d) => d.status === "pending");
  const completedDownloads = queue.filter((d) => d.status === "completed");
  const failedDownloads = queue.filter((d) => d.status === "failed");

  return (
    <div className="space-y-6">
      {/* Active Downloads */}
      {activeDownloads.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Download className="w-4 h-4 animate-bounce" />
            Downloading ({activeDownloads.length})
          </h3>
          <div className="space-y-2">
            {activeDownloads.map((item) => (
              <DownloadItem
                key={item.songId}
                item={item}
                onPause={onPause}
                onCancel={onCancel}
              />
            ))}
          </div>
        </section>
      )}

      {/* Pending Downloads */}
      {pendingDownloads.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Waiting ({pendingDownloads.length})
          </h3>
          <div className="space-y-2">
            {pendingDownloads.map((item) => (
              <DownloadItem
                key={item.songId}
                item={item}
                onCancel={onCancel}
              />
            ))}
          </div>
        </section>
      )}

      {/* Failed Downloads */}
      {failedDownloads.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Failed ({failedDownloads.length})
          </h3>
          <div className="space-y-2">
            {failedDownloads.map((item) => (
              <DownloadItem
                key={item.songId}
                item={item}
                onRetry={onRetry}
                onCancel={onCancel}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {queue.length === 0 && (
        <div className="text-center py-12">
          <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No downloads</h3>
          <p className="text-sm text-muted-foreground">
            Tap the download icon on any song to save it for offline listening
          </p>
        </div>
      )}
    </div>
  );
};

interface DownloadItemProps {
  item: {
    songId: string;
    songTitle: string;
    artist: string;
    thumbnail: string;
    status: "pending" | "downloading" | "completed" | "failed";
    progress: number;
  };
  onPause?: (songId: string) => void;
  onResume?: (songId: string) => void;
  onCancel?: (songId: string) => void;
  onRetry?: (songId: string) => void;
}

const DownloadItem: React.FC<DownloadItemProps> = ({
  item,
  onPause,
  onResume,
  onCancel,
  onRetry,
}) => {
  const statusColors = {
    pending: "text-muted-foreground",
    downloading: "text-primary",
    completed: "text-green-500",
    failed: "text-destructive",
  };

  const statusIcons = {
    pending: <Download className="w-4 h-4" />,
    downloading: <Download className="w-4 h-4 animate-pulse" />,
    completed: <CheckCircle2 className="w-4 h-4" />,
    failed: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="glass-card p-3 rounded-xl"
    >
      <div className="flex items-center gap-3">
        <img
          src={item.thumbnail}
          alt={item.songTitle}
          className="w-12 h-12 rounded-lg object-cover"
        />

        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{item.songTitle}</h4>
          <p className="text-sm text-muted-foreground truncate">{item.artist}</p>

          {item.status === "downloading" && (
            <div className="mt-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {item.progress}%
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={cn("p-1", statusColors[item.status])}>
            {statusIcons[item.status]}
          </span>

          {item.status === "downloading" && onPause && (
            <button
              onClick={() => onPause(item.songId)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {item.status === "failed" && onRetry && (
            <button
              onClick={() => onRetry(item.songId)}
              className="p-2 hover:bg-muted rounded-full transition-colors text-primary"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {onCancel && item.status !== "completed" && (
            <button
              onClick={() => onCancel(item.songId)}
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Storage indicator component
interface StorageIndicatorProps {
  usedBytes: number;
  totalBytes: number;
  songsCount: number;
}

export const StorageIndicator: React.FC<StorageIndicatorProps> = ({
  usedBytes,
  totalBytes,
  songsCount,
}) => {
  const usedPercent = (usedBytes / totalBytes) * 100;
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  const getStorageColor = () => {
    if (usedPercent < 50) return "from-green-500 to-emerald-500";
    if (usedPercent < 80) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-primary" />
          <span className="font-medium">Storage</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {songsCount} songs
        </span>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
        <motion.div
          className={cn("h-full bg-gradient-to-r", getStorageColor())}
          initial={{ width: 0 }}
          animate={{ width: `${usedPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {usedMB} MB used
        </span>
        <span className="text-muted-foreground">
          {totalMB} MB total
        </span>
      </div>
    </div>
  );
};

// Offline mode indicator
interface OfflineModeIndicatorProps {
  isOnline: boolean;
  offlineCount: number;
}

export const OfflineModeIndicator: React.FC<OfflineModeIndicatorProps> = ({
  isOnline,
  offlineCount,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        isOnline
          ? "bg-green-500/10 text-green-500"
          : "bg-yellow-500/10 text-yellow-500"
      )}
    >
      {isOnline ? (
        <Wifi className="w-5 h-5" />
      ) : (
        <WifiOff className="w-5 h-5" />
      )}
      <div className="flex-1">
        <p className="font-medium">
          {isOnline ? "You're online" : "You're offline"}
        </p>
        <p className="text-sm opacity-80">
          {isOnline
            ? "Stream from any source"
            : `${offlineCount} songs available offline`}
        </p>
      </div>
      {!isOnline && (
        <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
          Offline Mode
        </span>
      )}
    </motion.div>
  );
};
