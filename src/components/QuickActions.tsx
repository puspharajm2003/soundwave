import React from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  color: string;
  onClick?: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon: Icon, label, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 p-4 rounded-2xl glass-card hover:bg-muted/50 transition-colors w-full text-left"
    )}
  >
    <div className={cn(
      "p-3 rounded-xl",
      color
    )}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="font-medium">{label}</span>
  </motion.button>
);

export const QuickActions: React.FC = () => {
  const actions: QuickActionProps[] = [
    {
      icon: Clock,
      label: "Recently Played",
      color: "bg-primary/20 text-primary",
    },
    {
      icon: TrendingUp,
      label: "Trending Now",
      color: "bg-accent/20 text-accent",
    },
    {
      icon: Zap,
      label: "Quick Mix",
      color: "bg-destructive/20 text-destructive",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
        >
          <QuickAction {...action} />
        </motion.div>
      ))}
    </motion.div>
  );
};
