import { useState } from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isWithinInterval, eachWeekOfInterval, endOfWeek, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Activity, Scale, Calendar, TrendingUp, Clock, Flame } from "lucide-react";
import MemphisCard from "./MemphisCard";
import MemphisButton from "./MemphisButton";
import { ExerciseEntry, WeightEntry } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Label } from "recharts";

const COLORS = ['#FF7F50', '#FFF700', '#AAF0D1', '#000000', '#FF4444', '#4444FF', '#44FF44'];

const getCaloriesPerMin = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('run')) return 10;
  if (t.includes('swim')) return 9;
  if (t.includes('cycl') || t.includes('bike')) return 8;
  if (t.includes('walk') || t.includes('hike') || t.includes('徒步')) return 4;
  if (t.includes('yoga')) return 3;
  if (t.includes('strength') || t.includes('weight')) return 6;
  return 7;
};

interface MonthlyReportProps {
  exercises: ExerciseEntry[];
  weights: WeightEntry[];
  userId?: string;
}

export default function MonthlyReport({ exercises, weights, userId }: MonthlyReportProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const userExercises = userId ? exercises.filter(e => e.userId === userId) : exercises;

  const monthlyExercises = userExercises.filter(e => 
    isWithinInterval(new Date(e.timestamp), { start: monthStart, end: monthEnd })
  ).sort((a, b) => a.timestamp - b.timestamp);

  const totalDuration = monthlyExercises.reduce((acc, curr) => acc + curr.duration, 0);
  const totalCalories = monthlyExercises.reduce((acc, curr) => acc + (curr.duration * getCaloriesPerMin(curr.type)), 0);

  // Calculate Weekly Data
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });
  const weeklyData = weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const weekExercises = monthlyExercises.filter(e => 
      isWithinInterval(new Date(e.timestamp), { 
        start: weekStart > monthStart ? weekStart : monthStart, 
        end: weekEnd < monthEnd ? weekEnd : monthEnd 
      })
    );
    
    return {
      name: `Week ${index + 1}`,
      duration: weekExercises.reduce((acc, curr) => acc + curr.duration, 0),
      calories: weekExercises.reduce((acc, curr) => acc + (curr.duration * getCaloriesPerMin(curr.type)), 0),
    };
  });

  // Aggregate exercises by type for Pie Chart
  const aggregatedExercises = monthlyExercises.reduce((acc: { [key: string]: number }, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + curr.duration;
    return acc;
  }, {});

  const pieData = Object.entries(aggregatedExercises)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="p-6 space-y-12 max-w-6xl mx-auto">
      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white border-8 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] -rotate-1">
        <MemphisButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} color="lemon">
          <ChevronLeft size={32} />
        </MemphisButton>
        
        <div className="text-center">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-2 w-12 bg-coral border-2 border-black"></div>
            <p className="font-bold uppercase tracking-[0.3em] text-sm">Monthly Performance</p>
            <div className="h-2 w-12 bg-mint border-2 border-black"></div>
          </div>
        </div>

        <MemphisButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} color="mint">
          <ChevronRight size={32} />
        </MemphisButton>
      </div>

      {/* Top Stats - Compact and in one row */}
      <div className="grid grid-cols-2 gap-6">
        <MemphisCard color="mint" className="rotate-1 group overflow-hidden py-4 px-6">
          <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Clock size={100} strokeWidth={4} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1 bg-black text-white border-2 border-black">
                <Clock size={16} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Total Time</h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tighter">{totalDuration}</span>
              <span className="text-sm font-bold uppercase">min</span>
            </div>
            <div className="mt-2 h-3 w-full bg-black/10 border-2 border-black overflow-hidden">
              <div className="h-full bg-black transition-all duration-1000" style={{ width: `${Math.min(100, (totalDuration / 1200) * 100)}%` }}></div>
            </div>
          </div>
        </MemphisCard>

        <MemphisCard color="lemon" className="-rotate-1 group overflow-hidden py-4 px-6">
          <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Flame size={100} strokeWidth={4} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1 bg-black text-white border-2 border-black">
                <Flame size={16} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Calories</h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tighter">{totalCalories}</span>
              <span className="text-sm font-bold uppercase">kcal</span>
            </div>
            <div className="mt-2 h-3 w-full bg-black/10 border-2 border-black overflow-hidden">
              <div className="h-full bg-black transition-all duration-1000" style={{ width: `${Math.min(100, (totalCalories / 8000) * 100)}%` }}></div>
            </div>
          </div>
        </MemphisCard>
      </div>

      {/* Weekly Comparison - NEW SECTION */}
      <MemphisCard color="white" className="rotate-1">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <TrendingUp size={32} />
            <h3 className="text-3xl font-black uppercase tracking-tighter">Weekly Comparison</h3>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-coral border-2 border-black"></div>
              <span className="text-xs font-bold uppercase">Duration</span>
            </div>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="8 8" stroke="#000" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#000" 
                tick={{ fontSize: 14, fontWeight: 900 }} 
                axisLine={{ strokeWidth: 4 }}
              />
              <YAxis 
                stroke="#000" 
                tick={{ fontSize: 12, fontWeight: 700 }} 
                axisLine={{ strokeWidth: 4 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ 
                  backgroundColor: "#FFF", 
                  border: "4px solid black", 
                  boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
                  fontWeight: "bold" 
                }} 
              />
              <Bar dataKey="duration" fill="#FF7F50" stroke="#000" strokeWidth={3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MemphisCard>

      {/* Exercise Breakdown - REDESIGNED */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <MemphisCard color="coral" className="lg:col-span-2 -rotate-1 flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 text-center">Activity Mix</h3>
          <div className="relative w-full aspect-square max-w-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={4}
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <Label 
                    value="MIX" 
                    position="center" 
                    className="font-black text-4xl uppercase"
                    fill="#000"
                  />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#FFF", border: "4px solid black", fontWeight: "bold" }}
                  formatter={(value: number) => [`${value} min`, 'Duration']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MemphisCard>

        <div className="lg:col-span-3 space-y-4">
          {pieData.length > 0 ? (
            pieData.map((item, index) => (
              <div 
                key={item.name} 
                className="bg-white border-4 border-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-6 group hover:-translate-y-1 transition-transform"
              >
                <div 
                  className="w-16 h-16 border-4 border-black flex items-center justify-center text-2xl font-black shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                >
                  {Math.round((item.value / totalDuration) * 100)}%
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <h4 className="text-xl font-black uppercase tracking-tight">{item.name}</h4>
                    <span className="font-bold text-lg">{item.value} MIN</span>
                  </div>
                  <div className="h-3 w-full bg-black/5 border-2 border-black overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 delay-300" 
                      style={{ 
                        backgroundColor: COLORS[index % COLORS.length],
                        width: `${(item.value / totalDuration) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center bg-white/30 border-4 border-black border-dashed p-12">
              <p className="text-2xl font-black uppercase opacity-30 italic text-center">No Activity Data Yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

