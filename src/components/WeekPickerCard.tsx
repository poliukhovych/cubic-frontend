import React from "react";
import WeekDots from "@/components/WeekDots";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

type Props = {
  week: number;
  totalWeeks: number;
  rangeText: string;
  onChange: (w: number) => void;
  titleCenter?: React.ReactNode;
  currentWeek?: number;
};

const WeekPickerCard: React.FC<Props> = ({ week, totalWeeks, rangeText, onChange, titleCenter, currentWeek }) => {
  return (
    <motion.div 
      className="glass glass-card p-5 space-y-4 rounded-xl overflow-hidden relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-lg font-medium">Календар тижня</span>
        </div>
        
        {titleCenter && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }}
          >
            {titleCenter}
          </motion.div>
        )}
      </div>
      
      <motion.div 
        className="text-center" 
        initial={{ opacity: 0, y: 5 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <div className="text-2xl font-medium text-foreground">Тиждень #{week}</div>
        <div className="text-sm text-muted-foreground mt-1">{rangeText}</div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <WeekDots total={totalWeeks} value={week} onChange={onChange} current={currentWeek} />
      </motion.div>

      {/* Decorative elements */}
      <motion.div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/5" 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      />
      <motion.div 
        className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-primary/3" 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />
    </motion.div>
  );
};

export default WeekPickerCard;
