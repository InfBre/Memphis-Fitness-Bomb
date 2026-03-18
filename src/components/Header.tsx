import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LogIn, LogOut, User, Activity, BarChart2, Users, Edit2, Check, X, PieChart } from "lucide-react";
import MemphisButton from "./MemphisButton";

interface HeaderProps {
  user: any;
  profile: any;
  onLogin: () => void;
  onLogout: () => void;
  onUpdateName: (name: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ user, profile, onLogin, onLogout, onUpdateName, activeTab, setActiveTab }: HeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (profile?.displayName) {
      setNewName(profile.displayName);
    }
  }, [profile]);

  const handleSave = () => {
    if (newName.trim()) {
      onUpdateName(newName.trim());
      setIsEditing(false);
    }
  };

  return (
    <header className="relative z-10 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-lemon border-4 border-black p-4 -rotate-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          FITNESS <span className="text-coral">BOMB</span>
        </h1>
      </motion.div>

      <nav className="flex flex-wrap gap-4 justify-center">
        {[
          { id: "dashboard", icon: BarChart2, label: "Summary" },
          { id: "log", icon: Activity, label: "Log" },
          { id: "social", icon: Users, label: "Social" },
          { id: "report", icon: PieChart, label: "Report" },
        ].map((item) => (
          <MemphisButton
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            color={activeTab === item.id ? "mint" : "white"}
            className={activeTab === item.id ? "-rotate-2" : "rotate-1"}
          >
            <div className="flex items-center gap-2">
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          </MemphisButton>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="bg-mint border-4 border-black p-2 rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <User size={20} />
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white border-2 border-black px-1 font-bold text-sm w-24 outline-none"
                    autoFocus
                  />
                  <button onClick={handleSave} className="hover:text-coral"><Check size={16} /></button>
                  <button onClick={() => setIsEditing(false)} className="hover:text-coral"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                  <span className="font-bold">{profile?.displayName || user.displayName || "KKii"}</span>
                  <Edit2 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
            <MemphisButton onClick={onLogout} color="coral">
              <LogOut size={20} />
            </MemphisButton>
          </div>
        ) : (
          <MemphisButton onClick={onLogin} color="mint">
            <div className="flex items-center gap-2">
              <LogIn size={20} />
              <span>Login</span>
            </div>
          </MemphisButton>
        )}
      </div>
    </header>
  );
}
