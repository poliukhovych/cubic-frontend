import React from "react";
import { motion } from "framer-motion";

type Props = {
  total: number;         // скільки тижнів
  value: number;         // обраний тиждень (1-based)
  onChange: (week: number) => void;
  current?: number;      // поточний тиждень (1-based), підсвічується завжди
};

const WeekDots: React.FC<Props> = ({ total, value, onChange, current }) => {
  return (
    <div className="flex justify-center gap-3 flex-wrap px-2 py-1">
      {Array.from({ length: total }, (_, i) => {
        const week = i + 1;
        const isActive = week === value;
        const isCurrent = typeof current === "number" && week === current;

        return (
          <motion.button
            key={week}
            onClick={() => onChange(week)}
            className={`
              relative w-6 h-6 rounded-full border transition-all duration-200
              ${isActive 
                ? "bg-primary border-primary/50 shadow-sm" 
                : "bg-muted/10 border-muted/20 hover:bg-muted/30"}
              ${isCurrent && !isActive ? "ring-2 ring-primary/30 ring-offset-1" : ""}
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: isActive ? 1.1 : 1,
              y: isActive ? -3 : 0
            }}
            transition={{ 
              delay: i * 0.02,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1]
            }}
            aria-label={`Тиждень ${week}`}
            aria-current={isCurrent ? "true" : undefined}
            title={isCurrent ? `Тиждень ${week} (поточний)` : `Тиждень ${week}`}
          >
            {isActive && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-primary-foreground">
                {week}
              </span>
            )}
            
            {isCurrent && !isActive && (
              <motion.span 
                className="absolute inset-0 flex items-center justify-center text-[8px] text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                •
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default WeekDots;
