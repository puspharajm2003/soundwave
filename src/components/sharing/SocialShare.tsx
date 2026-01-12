import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, 
  X, 
  Copy, 
  Check,
  MessageCircle,
  Mail,
  Link as LinkIcon,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song, Playlist } from "@/types/music";
import { toast } from "sonner";

interface SocialShareProps {
  isOpen: boolean;
  onClose: () => void;
  item: Song | Playlist | null;
  type: "song" | "playlist";
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  action: (url: string, text: string) => void;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  isOpen,
  onClose,
  item,
  type,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!item) return null;

  const title = type === "song" 
    ? `${(item as Song).title} by ${(item as Song).artist}` 
    : (item as Playlist).name;
  
  const description = type === "song"
    ? `Listen to ${(item as Song).title} by ${(item as Song).artist}`
    : `Check out this playlist: ${(item as Playlist).name}`;
  
  // Generate a shareable URL (in a real app, this would be a proper URL)
  const shareUrl = `https://soundwave.app/${type}/${item.id}`;

  const shareOptions: ShareOption[] = [
    {
      id: "twitter",
      name: "Twitter/X",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-black text-white",
      action: (url, text) => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
      },
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "bg-[#1877F2] text-white",
      action: (url) => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
      },
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      color: "bg-[#25D366] text-white",
      action: (url, text) => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank");
      },
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      color: "bg-[#0088CC] text-white",
      action: (url, text) => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
      },
    },
    {
      id: "email",
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-muted text-foreground",
      action: (url, text) => {
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`, "_blank");
      },
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-md p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Share</h2>
                  <p className="text-sm text-muted-foreground">
                    Share with friends
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item Preview */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 mb-6">
              <img
                src={type === "song" ? (item as Song).thumbnail : (item as Playlist).thumbnail}
                alt={title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{title}</p>
                <p className="text-sm text-muted-foreground">
                  {type === "song" ? (item as Song).album : `${(item as Playlist).songCount} songs`}
                </p>
              </div>
            </div>

            {/* Native Share (if available) */}
            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                variant="glow"
                className="w-full mb-4"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}

            {/* Social Share Options */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {shareOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => option.action(shareUrl, description)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl ${option.color} transition-all`}
                >
                  {option.icon}
                  <span className="text-[10px] font-medium">{option.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
              <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-muted-foreground outline-none truncate"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={copyLink}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* QR Code Toggle */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              {showQR ? "Hide QR Code" : "Show QR Code"}
            </button>

            {/* QR Code */}
            <AnimatePresence>
              {showQR && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-6 rounded-xl bg-white flex items-center justify-center">
                    {/* Placeholder QR code - in a real app, use a QR library */}
                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-muted-foreground" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialShare;
