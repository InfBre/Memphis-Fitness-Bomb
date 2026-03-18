import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Trash2 } from "lucide-react";
import MemphisCard from "./MemphisCard";
import { ExerciseEntry, WeightEntry } from "../types";
import { format, startOfWeek, endOfWeek, isWithinInterval, subMonths, isAfter, getDay, addDays } from "date-fns";

interface DashboardProps {
  exercises: ExerciseEntry[];
  weights: WeightEntry[];
  userId?: string;
  onDeleteExercise: (id: string) => void;
  onDeleteWeight: (id: string) => void;
}

export default function Dashboard({ exercises, weights, userId, onDeleteExercise, onDeleteWeight }: DashboardProps) {
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

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <MemphisCard color="mint" className="rotate-1">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Weekly Activity (min)</h2>
          <span className="text-xs font-bold bg-black text-white px-2 py-1 uppercase">
            {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd")}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={exerciseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
              <XAxis dataKey="name" stroke="#000" tick={{ fontWeight: "bold" }} />
              <YAxis stroke="#000" tick={{ fontWeight: "bold" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#FFF700", border: "4px solid black", fontWeight: "bold" }}
                labelFormatter={(label, payload) => {
                  const item = payload[0]?.payload;
                  return item ? `${label} (${item.date})` : label;
                }}
              />
              <Bar dataKey="time" fill="#FF7F50" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MemphisCard>

      <MemphisCard color="lemon" className="-rotate-1">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Weight Progress (kg)</h2>
          <span className="text-xs font-bold bg-black text-white px-2 py-1 uppercase">
            {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd")}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" />
              <XAxis dataKey="date" stroke="#000" tick={{ fontWeight: "bold" }} />
              <YAxis stroke="#000" tick={{ fontWeight: "bold" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#AAF0D1", border: "4px solid black", fontWeight: "bold" }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#FF7F50" 
                strokeWidth={4} 
                dot={{ r: 6, fill: "#000", stroke: "#000" }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </MemphisCard>

      <MemphisCard color="white" className="lg:col-span-2 rotate-1">
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Recent Exercise Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-coral text-white border-4 border-black">
                <th className="p-3 text-left border-r-4 border-black">Date</th>
                <th className="p-3 text-left border-r-4 border-black">Type</th>
                <th className="p-3 text-left border-r-4 border-black">Duration</th>
                <th className="p-3 text-left border-r-4 border-black">User</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {userExercises.length > 0 ? (
                userExercises.slice(0, 5).map((e, i) => (
                  <tr key={e.id} className={i % 2 === 0 ? "bg-mint/20" : "bg-white"}>
                    <td className="p-3 border-4 border-black font-bold">{format(new Date(e.timestamp), "yyyy-MM-dd")}</td>
                    <td className="p-3 border-4 border-black font-bold">{e.type}</td>
                    <td className="p-3 border-4 border-black font-bold">{e.duration} min</td>
                    <td className="p-3 border-4 border-black font-bold">{e.userName}</td>
                    <td className="p-3 border-4 border-black text-center">
                      <button 
                        onClick={() => onDeleteExercise(e.id)}
                        className="p-2 bg-coral border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center font-bold text-xl uppercase opacity-50">
                    No records found yet. Go to "Log" to add some!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MemphisCard>

    </div>
  );
}
