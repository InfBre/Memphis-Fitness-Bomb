import React, { useState, useRef, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MemphisDatePickerProps {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
}

export default function MemphisDatePicker({ value, onChange, label }: MemphisDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = new Date(value);
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(subMonths(viewDate, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(addMonths(viewDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    onChange(format(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block font-black uppercase mb-2">{label}</label>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="memphis-input flex items-center justify-between cursor-pointer hover:bg-black/5 transition-colors"
      >
        <span className="font-bold">{format(selectedDate, "yyyy/MM/dd")}</span>
        <CalendarIcon size={20} className="text-black" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, rotate: 1 }}
            animate={{ opacity: 1, y: 5, scale: 1, rotate: -1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95, rotate: 1 }}
            className="absolute z-50 top-full left-0 w-72 bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-2">
              <button 
                onClick={handlePrevMonth}
                className="p-1 hover:bg-lemon border-2 border-black transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-black uppercase tracking-tighter text-lg">
                {format(viewDate, "MMMM yyyy")}
              </h3>
              <button 
                onClick={handleNextMonth}
                className="p-1 hover:bg-lemon border-2 border-black transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-center text-xs font-black uppercase opacity-50">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={i}
                    onClick={() => handleDateSelect(day)}
                    className={`
                      h-8 w-8 flex items-center justify-center text-sm font-bold border-2 transition-all
                      ${isSelected ? 'bg-black text-white border-black' : 'border-transparent hover:border-black hover:bg-lemon/30'}
                      ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                      ${isTodayDate && !isSelected ? 'text-coral underline decoration-2 underline-offset-2' : ''}
                    `}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-2 border-t-2 border-black flex justify-end">
              <button 
                onClick={() => handleDateSelect(new Date())}
                className="text-xs font-black uppercase hover:text-coral transition-colors"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
