import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RadioModeButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
  seedSongTitle?: string;
}

export const RadioModeButton: React.FC<RadioModeButtonProps> = ({
  isEnabled,
  onToggle,
  seedSongTitle,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "relative transition-all duration-300",
            isEnabled && "text-primary"
          )}
        >
          <AnimatePresence mode="wait">
            {isEnabled ? (
              <motion.div
                key="enabled"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="relative"
              >
                <Radio className="w-5 h-5" />
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 rounded-full bg-primary"
                />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-accent" />
              </motion.div>
            ) : (
              <motion.div
                key="disabled"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Radio className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-medium">
            {isEnabled ? "Radio Mode Active" : "Enable Radio Mode"}
          </p>
          {isEnabled && seedSongTitle && (
            <p className="text-xs text-muted-foreground mt-1">
              Based on "{seedSongTitle}"
            </p>
          )}
          {!isEnabled && (
            <p className="text-xs text-muted-foreground mt-1">
              Auto-play similar songs
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
