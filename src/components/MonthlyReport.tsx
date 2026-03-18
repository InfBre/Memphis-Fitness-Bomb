import { useState } from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight, Activity, Scale, Calendar } from "lucide-react";
import MemphisCard from "./MemphisCard";
import MemphisButton from "./MemphisButton";
import { ExerciseEntry, WeightEntry } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ['#FF7F50', '#FFF700', '#AAF0D1', '#000000', '#FF4444', '#4444FF', '#44FF44'];

const getCaloriesPerMin = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('run')) return 10;
  if (t.includes('swim')) return 9;
  if (t.includes('cycl') || t.includes('bike')) return 8;
  if (t.includes('walk')) return 4;
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

  // Prepare chart data for the month
  const exerciseChartData = monthlyExercises.reduce((acc: any[], curr) => {
    const dateStr = format(new Date(curr.timestamp), "dd");
    const existing = acc.find(d => d.date === dateStr);
    if (existing) {
      existing.duration += curr.duration;
    } else {
      acc.push({ date: dateStr, duration: curr.duration });
    }
    return acc;
  }, []);

  // Aggregate exercises by type for Pie Chart
  const aggregatedExercises = monthlyExercises.reduce((acc: { [key: string]: number }, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + curr.duration;
    return acc;
  }, {});

  const pieData = Object.entries(aggregatedExercises).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white border-8 border-black p-6 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] -rotate-1">
        <MemphisButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} color="lemon">
          <ChevronLeft size={32} />
        </MemphisButton>
        
        <div className="text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <p className="font-bold opacity-60 uppercase tracking-widest">Monthly Report</p>
        </div>

        <MemphisButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} color="mint">
          <ChevronRight size={32} />
        </MemphisButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MemphisCard color="mint" className="rotate-1">
          <div className="flex items-center gap-4 mb-4">
            <Activity size={32} />
            <h3 className="text-2xl font-black uppercase">Total Duration</h3>
          </div>
          <p className="text-6xl font-black mb-2">{totalDuration} <span className="text-2xl">min</span></p>
          <p className="font-bold opacity-70 uppercase tracking-widest">Active time this month</p>
        </MemphisCard>

        <MemphisCard color="lemon" className="-rotate-1">
          <div className="flex items-center gap-4 mb-4">
            <Scale size={32} />
            <h3 className="text-2xl font-black uppercase">Calories Burned</h3>
          </div>
          <p className="text-6xl font-black mb-2">{totalCalories} <span className="text-2xl">kcal</span></p>
          <p className="font-bold opacity-70 uppercase tracking-widest">Estimated energy output</p>
        </MemphisCard>
      </div>

      {/* Daily Activity Chart */}
      <MemphisCard color="white" className="rotate-1">
        <div className="flex items-center gap-4 mb-6">
          <Activity size={32} />
          <h3 className="text-2xl font-black uppercase">Daily Activity (min)</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={exerciseChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
              <XAxis dataKey="date" stroke="#000" tick={{ fontSize: 12, fontWeight: "bold" }} />
              <YAxis stroke="#000" tick={{ fontSize: 12, fontWeight: "bold" }} />
              <Tooltip contentStyle={{ backgroundColor: "#FFF700", border: "4px solid black", fontWeight: "bold" }} />
              <Bar dataKey="duration" fill="#FF7F50" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MemphisCard>

      {/* Monthly Summary Pie Chart */}
      <MemphisCard color="white" className="-rotate-1">
        <div className="flex items-center gap-4 mb-6">
          <Calendar size={32} />
          <h3 className="text-2xl font-black uppercase">Exercise Breakdown</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#FFF700", border: "4px solid black", fontWeight: "bold" }}
                  formatter={(value: number) => [`${value} min`, 'Duration']}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {Object.entries(aggregatedExercises).map(([type, duration], index) => (
              <div key={type} className="p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center" style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-black" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xl font-black uppercase">{type}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black">{duration} min</span>
                  <p className="text-xs font-bold opacity-50 uppercase">{((duration / totalDuration) * 100).toFixed(1)}% of total</p>
                </div>
              </div>
            ))}
            {pieData.length === 0 && (
              <p className="text-center py-12 font-bold opacity-30 uppercase italic tracking-widest">No exercises recorded for this month</p>
            )}
          </div>
        </div>
      </MemphisCard>
    </div>
  );
}
