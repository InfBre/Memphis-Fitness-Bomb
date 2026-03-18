import React, { useState } from "react";
import MemphisCard from "./MemphisCard";
import MemphisButton from "./MemphisButton";
import MemphisDatePicker from "./MemphisDatePicker";
import { Activity, Scale, Plus, Trash2 } from "lucide-react";
import { ExerciseEntry } from "../types";
import { format } from "date-fns";

interface LogFormProps {
  exercises: ExerciseEntry[];
  onAddExercise: (type: string, duration: number, timestamp: number, calories?: number) => void;
  onAddWeight: (weight: number, timestamp: number) => void;
  onDeleteExercise: (id: string) => void;
}

export default function LogForm({ exercises, onAddExercise, onAddWeight, onDeleteExercise }: LogFormProps) {
  const [exerciseType, setExerciseType] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const exerciseTypes = [
    { name: "BodyPump (杠铃操)", met: 6 },
    { name: "BodyCombat (搏击操)", met: 8 },
    { name: "Zumba (尊巴)", met: 7 },
    { name: "Yoga (瑜伽)", met: 3 },
    { name: "Pilates (普拉提)", met: 3 },
    { name: "HIIT (高强度间歇)", met: 10 },
    { name: "Running (跑步)", met: 10 },
    { name: "Hiking (徒步)", met: 6 },
    { name: "Cycling (骑行)", met: 8 }
  ];

  const handleExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exerciseType && duration && date) {
      const timestamp = new Date(date).getTime();
      let finalCalories = calories ? parseInt(calories) : 0;
      
      // Estimate calories if not provided
      if (!finalCalories) {
        const selectedType = exerciseTypes.find(t => t.name === exerciseType);
        const met = selectedType ? selectedType.met : 5; // Default MET
        // Simple estimation: MET * 70kg (avg) * (duration / 60)
        finalCalories = Math.round(met * 70 * (parseInt(duration) / 60));
      }

      onAddExercise(exerciseType, parseInt(duration), timestamp, finalCalories);
      setExerciseType("");
      setDuration("");
      setCalories("");
    }
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && date) {
      const timestamp = new Date(date).getTime();
      onAddWeight(parseFloat(weight), timestamp);
      setWeight("");
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <MemphisCard color="mint" className="rotate-1">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Log Exercise</h2>
        </div>
        <form onSubmit={handleExerciseSubmit} className="space-y-6">
          <MemphisDatePicker 
            label="Date"
            value={date}
            onChange={setDate}
          />
          <div>
            <label className="block font-black uppercase mb-2">Quick Select</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {exerciseTypes.map(type => (
                <button
                  key={type.name}
                  type="button"
                  onClick={() => setExerciseType(type.name)}
                  className={`px-3 py-1 border-2 border-black font-bold text-sm uppercase transition-all ${exerciseType === type.name ? 'bg-black text-white' : 'bg-white hover:bg-black/5'}`}
                >
                  {type.name}
                </button>
              ))}
            </div>
            <label className="block font-black uppercase mb-2">Exercise Type</label>
            <input 
              type="text" 
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              placeholder="e.g. Running, Yoga" 
              className="memphis-input"
              required
            />
          </div>
          <div>
            <label className="block font-black uppercase mb-2">Duration (min)</label>
            <input 
              type="number" 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 30" 
              className="memphis-input"
              required
            />
          </div>
          <div>
            <label className="block font-black uppercase mb-2">Calories (kcal) - Optional</label>
            <input 
              type="number" 
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 250" 
              className="memphis-input"
            />
          </div>
          <MemphisButton type="submit" color="lemon" className="w-full">
            <div className="flex items-center justify-center gap-2">
              <span className="font-black uppercase">Add Exercise</span>
            </div>
          </MemphisButton>
        </form>
      </MemphisCard>

      <MemphisCard color="coral" className="-rotate-1">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Log Weight</h2>
        </div>
        <form onSubmit={handleWeightSubmit} className="space-y-6">
          <MemphisDatePicker 
            label="Date"
            value={date}
            onChange={setDate}
          />
          <div>
            <label className="block font-black uppercase mb-2">Current Weight (kg)</label>
            <input 
              type="number" 
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 70.5" 
              className="memphis-input"
              required
            />
          </div>
          <MemphisButton type="submit" color="mint" className="w-full">
            <div className="flex items-center justify-center gap-2">
              <span className="font-black uppercase">Add Weight</span>
            </div>
          </MemphisButton>
        </form>
      </MemphisCard>

      <MemphisCard color="lavender" className="md:col-span-2 rotate-1">
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Recent Exercise Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white border-4 border-black">
                <th className="p-3 text-left border-r-4 border-white">Date</th>
                <th className="p-3 text-left border-r-4 border-white">Type</th>
                <th className="p-3 text-left border-r-4 border-white">Duration</th>
                <th className="p-3 text-left border-r-4 border-white">User</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {exercises.length > 0 ? (
                exercises.slice(0, 10).map((e, i) => (
                  <tr key={e.id} className={i % 2 === 0 ? "bg-white/40" : "bg-white/20"}>
                    <td className="p-3 border-4 border-black font-bold">{format(new Date(e.timestamp), "yyyy-MM-dd")}</td>
                    <td className="p-3 border-4 border-black font-bold">{e.type}</td>
                    <td className="p-3 border-4 border-black font-bold">{e.duration} min</td>
                    <td className="p-3 border-4 border-black font-bold">{e.userName}</td>
                    <td className="p-3 border-4 border-black text-center">
                      <button 
                        onClick={() => onDeleteExercise(e.id)}
                        className="px-3 py-1 bg-coral border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center font-bold text-xl uppercase opacity-50">
                    No records found yet.
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
