import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import MemphisCard from "./MemphisCard";
import { ExerciseEntry, WeightEntry } from "../types";
import { format, startOfWeek, endOfWeek, isWithinInterval, subMonths, isAfter, getDay, addDays } from "date-fns";

interface DashboardProps {
  exercises: ExerciseEntry[];
  weights: WeightEntry[];
  userId?: string;
}

export default function Dashboard({ exercises, weights, userId }: DashboardProps) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const userExercises = userId ? exercises.filter(e => e.userId === userId) : exercises;
  const userWeights = userId ? weights.filter(w => w.userId === userId) : weights;

  const weeklyExercises = userExercises.filter(e => 
    isWithinInterval(new Date(e.timestamp), { start: weekStart, end: weekEnd })
  );

  const weeklyWeights = userWeights.filter(w => 
    isWithinInterval(new Date(w.timestamp), { start: weekStart, end: weekEnd })
  ).sort((a, b) => a.timestamp - b.timestamp);

  const exerciseData = [
    { name: "Sun", date: format(weekStart, "MM/dd"), time: 0 },
    { name: "Mon", date: format(addDays(weekStart, 1), "MM/dd"), time: 0 },
    { name: "Tue", date: format(addDays(weekStart, 2), "MM/dd"), time: 0 },
    { name: "Wed", date: format(addDays(weekStart, 3), "MM/dd"), time: 0 },
    { name: "Thu", date: format(addDays(weekStart, 4), "MM/dd"), time: 0 },
    { name: "Fri", date: format(addDays(weekStart, 5), "MM/dd"), time: 0 },
    { name: "Sat", date: format(addDays(weekStart, 6), "MM/dd"), time: 0 },
  ];

  weeklyExercises.forEach(e => {
    const dayIndex = getDay(new Date(e.timestamp));
    if (exerciseData[dayIndex]) {
      exerciseData[dayIndex].time += e.duration;
    }
  });

  const weightData = weeklyWeights.map(w => ({
    date: format(new Date(w.timestamp), "MM/dd"),
    weight: w.weight,
  }));

  const totalDuration = weeklyExercises.reduce((acc, curr) => acc + curr.duration, 0);
  const totalCalories = weeklyExercises.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const latestWeight = userWeights.length > 0 ? userWeights.sort((a, b) => b.timestamp - a.timestamp)[0].weight : null;

  return (
    <div className="min-h-[calc(100vh-180px)] lg:h-[calc(100vh-180px)] flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full gap-6 overflow-y-auto lg:overflow-hidden">
      {/* Welcome & Quick Stats Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter -rotate-1">
            Weekly <span className="text-coral">Overview</span>
          </h2>
          <p className="font-bold uppercase tracking-widest text-[10px] opacity-60 italic">
            {format(weekStart, "MMMM dd")} — {format(weekEnd, "MMMM dd")}
          </p>
        </div>
        
        {/* Quick Stats Grid - Compact */}
        <div className="flex gap-4">
          {[
            { label: "Minutes", value: totalDuration, unit: "min", color: "mint" },
            { label: "Calories", value: totalCalories, unit: "kcal", color: "lemon" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-${stat.color} border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
            >
              <p className="text-[10px] font-black uppercase opacity-70 leading-none mb-1">{stat.label}</p>
              <p className="text-xl md:text-2xl font-black tracking-tighter leading-none">
                {stat.value}<span className="text-[10px] ml-1 uppercase">{stat.unit}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Grid - Adjusted for one screen on large displays, scrollable on small */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <MemphisCard color="mint" className="rotate-1 flex flex-col h-full min-h-[300px] lg:min-h-0 overflow-hidden">
          <div className="flex justify-between items-start mb-4 border-b-4 border-black pb-2">
            <h3 className="text-xl font-black uppercase tracking-tighter">Activity Distribution</h3>
            <div className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">Weekly</div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exerciseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" stroke="#000" tick={{ fontWeight: "bold", fontSize: 10 }} axisLine={{ strokeWidth: 2 }} />
                <YAxis stroke="#000" tick={{ fontWeight: "bold", fontSize: 10 }} axisLine={{ strokeWidth: 2 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                  contentStyle={{ backgroundColor: "#FFF700", border: "4px solid black", fontWeight: "bold", boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  labelFormatter={(label, payload) => {
                    const item = payload[0]?.payload;
                    return item ? `${label} (${item.date})` : label;
                  }}
                />
                <Bar dataKey="time" fill="#FF7F50" stroke="#000" strokeWidth={2} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MemphisCard>

        <MemphisCard color="lemon" className="-rotate-1 flex flex-col h-full min-h-[300px] lg:min-h-0 overflow-hidden">
          <div className="flex justify-between items-start mb-4 border-b-4 border-black pb-2">
            <h3 className="text-xl font-black uppercase tracking-tighter">Weight Trend</h3>
            <div className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">Weekly</div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} opacity={0.2} />
                <XAxis dataKey="date" stroke="#000" tick={{ fontWeight: "bold", fontSize: 10 }} axisLine={{ strokeWidth: 2 }} />
                <YAxis stroke="#000" tick={{ fontWeight: "bold", fontSize: 10 }} axisLine={{ strokeWidth: 2 }} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#AAF0D1", border: "4px solid black", fontWeight: "bold", boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="weight" 
                  stroke="#FF7F50" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: "#000", stroke: "#000", strokeWidth: 2 }} 
                  activeDot={{ r: 8, fill: "#FF7F50", stroke: "#000", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MemphisCard>
      </div>
    </div>
  );
}
