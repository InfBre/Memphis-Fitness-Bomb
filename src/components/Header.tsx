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
    <header className="relative z-20 px-6 py-8">
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-4">
        {/* Logo Section */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-lemon border-4 border-black p-4 -rotate-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shrink-0"
        >
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
            FITNESS <br className="hidden sm:block lg:hidden" />
            <span className="text-coral">BOMB</span>
          </h1>
        </motion.div>

        {/* Navigation Section */}
        <nav className="flex flex-wrap gap-3 md:gap-4 justify-center items-center">
          {[
            { id: "dashboard", label: "SUMMARY", activeColor: "mint" },
            { id: "log", label: "LOG", activeColor: "lemon" },
            { id: "social", label: "SOCIAL", activeColor: "lavender" },
            { id: "report", label: "REPORT", activeColor: "coral" },
          ].map((item, index) => (
            <MemphisButton
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              color={activeTab === item.id ? (item.activeColor as any) : "white"}
              className={`
                ${activeTab === item.id ? "scale-105 z-10" : "scale-100 opacity-90 hover:opacity-100"}
                ${index % 2 === 0 ? "rotate-1" : "-rotate-1"}
                transition-all duration-200 px-4 py-2 md:px-6 md:py-3
              `}
              style={activeTab === item.id ? { 
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                transform: `rotate(${index % 2 === 0 ? '2deg' : '-2deg'}) scale(1.05)`
              } : {}}
            >
              <div className="flex items-center gap-2">
                <span className="font-black text-sm md:text-base tracking-tight uppercase">{item.label}</span>
              </div>
            </MemphisButton>
          ))}
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="bg-mint border-4 border-black p-2 rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 min-w-[120px] justify-center">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white border-2 border-black px-1 font-bold text-xs w-20 outline-none"
                      autoFocus
                    />
                    <button onClick={handleSave} className="font-black text-[10px] hover:text-coral uppercase">Save</button>
                    <button onClick={() => setIsEditing(false)} className="font-black text-[10px] hover:text-coral uppercase">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                    <span className="font-black text-sm truncate max-w-[80px]">
                      {profile?.displayName || user.displayName || "KKii"}
                    </span>
                    <span className="text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                  </div>
                )}
              </div>
              <MemphisButton onClick={onLogout} color="coral" className="px-3 py-2">
                <span className="font-black text-xs uppercase">Logout</span>
              </MemphisButton>
            </div>
          ) : (
            <MemphisButton onClick={onLogin} color="mint" className="px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight uppercase">Login</span>
              </div>
            </MemphisButton>
          )}
        </div>
      </div>
    </header>
  );
}
