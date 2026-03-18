import React, { useState } from "react";
import MemphisCard from "./MemphisCard";
import MemphisButton from "./MemphisButton";
import MemphisDatePicker from "./MemphisDatePicker";
import { Activity, Scale, Plus } from "lucide-react";

interface LogFormProps {
  onAddExercise: (type: string, duration: number, timestamp: number) => void;
  onAddWeight: (weight: number, timestamp: number) => void;
}

export default function LogForm({ onAddExercise, onAddWeight }: LogFormProps) {
  const [exerciseType, setExerciseType] = useState("");
  const [duration, setDuration] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const exerciseTypes = [
    "BodyPump (杠铃操)", "BodyCombat (搏击操)", "Zumba (尊巴)", 
    "Yoga (瑜伽)", "Pilates (普拉提)", "HIIT (高强度间歇)", 
    "跑步", "徒步", "骑行"
  ];

  const handleExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exerciseType && duration && date) {
      const timestamp = new Date(date).getTime();
      onAddExercise(exerciseType, parseInt(duration), timestamp);
      setExerciseType("");
      setDuration("");
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
          <Activity size={32} />
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
                  key={type}
                  type="button"
                  onClick={() => setExerciseType(type)}
                  className={`px-3 py-1 border-2 border-black font-bold text-sm uppercase transition-all ${exerciseType === type ? 'bg-black text-white' : 'bg-white hover:bg-black/5'}`}
                >
                  {type}
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
          <MemphisButton type="submit" color="lemon" className="w-full">
            <div className="flex items-center justify-center gap-2">
              <Plus size={20} />
              <span>Add Exercise</span>
            </div>
          </MemphisButton>
        </form>
      </MemphisCard>

      <MemphisCard color="coral" className="-rotate-1">
        <div className="flex items-center gap-3 mb-6">
          <Scale size={32} />
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
              <Plus size={20} />
              <span>Add Weight</span>
            </div>
          </MemphisButton>
        </form>
      </MemphisCard>
    </div>
  );
}
