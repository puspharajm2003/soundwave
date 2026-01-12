import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showViewAll?: boolean;
  onViewAll?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  showViewAll = false,
  onViewAll,
  action,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  return (
    <motion.section
      ref={ref}
      style={{ opacity, y }}
      className={cn("mb-12", className)}
    >
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {showViewAll && (
            <button
              onClick={onViewAll}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
      {children}
    </motion.section>
  );
};

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:-mx-6 md:px-6",
      className
    )}>
      {children}
    </div>
  );
};

interface GridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({ children, columns = 4, className }) => {
  const colClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  };

  return (
    <div className={cn("grid gap-4 md:gap-6", colClasses[columns], className)}>
      {children}
    </div>
  );
};
