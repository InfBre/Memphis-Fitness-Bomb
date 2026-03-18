import React, { useState } from "react";
import MemphisCard from "./MemphisCard";
import { ExerciseEntry } from "../types";
import { formatDistanceToNow } from "date-fns";
import { User, Activity, Heart, MessageCircle, Send } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";

interface SocialProps {
  recentActivities: ExerciseEntry[];
  currentUser: FirebaseUser | null;
  onLike: (id: string, isLiked: boolean) => void;
  onAddComment: (id: string, text: string) => void;
}

export default function Social({ recentActivities, currentUser, onLike, onAddComment }: SocialProps) {
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  // Calculate Leaderboard (Top 3 by duration)
  const userStats = recentActivities.reduce((acc: { [key: string]: { name: string, duration: number, count: number } }, curr) => {
    if (!acc[curr.userId]) {
      acc[curr.userId] = { name: curr.userName || "Anonymous", duration: 0, count: 0 };
    }
    acc[curr.userId].duration += curr.duration;
    acc[curr.userId].count += 1;
    return acc;
  }, {});

  const leaderboard = Object.values(userStats)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 3);

  const totalCommunityDuration = recentActivities.reduce((acc, curr) => acc + curr.duration, 0);
  const totalCommunityWorkouts = recentActivities.length;

  const handleCommentSubmit = (e: React.FormEvent, activityId: string) => {
    e.preventDefault();
    const text = commentText[activityId];
    if (text?.trim()) {
      onAddComment(activityId, text);
      setCommentText(prev => ({ ...prev, [activityId]: "" }));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-black uppercase tracking-tighter -rotate-1">
          Community <span className="text-coral">Hype</span>
        </h2>
        <p className="font-bold uppercase tracking-widest text-sm opacity-60 italic">Connect • Compete • Conquer</p>
      </div>

      {/* Community Stats & Leaderboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Global Stats */}
        <MemphisCard color="lemon" className="-rotate-1 flex flex-col justify-center p-8">
          <h3 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">Global Impact</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-black uppercase opacity-60">Total Minutes Moved</p>
              <p className="text-5xl font-black tracking-tighter">{totalCommunityDuration}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase opacity-60">Workouts Logged</p>
              <p className="text-5xl font-black tracking-tighter">{totalCommunityWorkouts}</p>
            </div>
          </div>
        </MemphisCard>

        {/* Leaderboard */}
        <MemphisCard color="white" className="lg:col-span-2 rotate-1 p-8">
          <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
            <span className="bg-coral text-white p-1 border-2 border-black">TOP</span> 
            Performers This Month
          </h3>
          <div className="space-y-4">
            {leaderboard.map((user, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-black/5 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className={`w-12 h-12 flex items-center justify-center font-black text-2xl border-4 border-black ${idx === 0 ? 'bg-lemon' : idx === 1 ? 'bg-mint' : 'bg-coral'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-black uppercase text-xl">{user.name}</p>
                  <p className="text-sm font-bold opacity-60">{user.count} WORKOUTS</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-2xl tracking-tighter">{user.duration}</p>
                  <p className="text-xs font-black uppercase">MINUTES</p>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-center py-8 font-bold opacity-40 uppercase italic">Waiting for champions to emerge...</p>
            )}
          </div>
        </MemphisCard>
      </div>
      
      <div className="space-y-8">
        <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
          <div className="h-1 flex-1 bg-black"></div>
          Recent Activity
          <div className="h-1 flex-1 bg-black"></div>
        </h3>
        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          {recentActivities.map((activity, i) => {
          const isLiked = currentUser ? activity.likes?.includes(currentUser.uid) : false;
          const likesCount = activity.likes?.length || 0;
          const commentsCount = activity.comments?.length || 0;

          return (
            <MemphisCard 
              key={activity.id} 
              color={i % 3 === 0 ? "mint" : i % 3 === 1 ? "lemon" : "coral"}
              className={i % 2 === 0 ? "rotate-1" : "-rotate-1"}
            >
              <div className="flex flex-col gap-6">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="bg-white border-4 border-black p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <User size={32} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xl font-black uppercase">
                      {activity.userName} <span className="text-sm font-normal normal-case opacity-70">just finished</span>
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                      <Activity size={20} className="text-black" />
                      <p className="text-2xl font-black uppercase tracking-tight">
                        {activity.type} <span className="text-lg font-normal">for {activity.duration} min</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-bold opacity-60">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-4 border-t-4 border-black/10">
                  <button 
                    onClick={() => onLike(activity.id, !!isLiked)}
                    className={`flex items-center gap-2 font-black uppercase transition-all hover:scale-110 ${isLiked ? 'text-coral' : 'text-black'}`}
                  >
                    <Heart size={24} fill={isLiked ? "currentColor" : "none"} strokeWidth={3} />
                    <span>{likesCount}</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowComments(prev => ({ ...prev, [activity.id]: !prev[activity.id] }))}
                    className="flex items-center gap-2 font-black uppercase transition-all hover:scale-110 text-black"
                  >
                    <MessageCircle size={24} strokeWidth={3} />
                    <span>{commentsCount}</span>
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {showComments[activity.id] && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      {/* Comment List */}
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {activity.comments?.map((comment, idx) => (
                          <div key={idx} className="bg-white/50 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-xs font-black uppercase mb-1">{comment.userName}</p>
                            <p className="text-sm font-bold">{comment.text}</p>
                          </div>
                        ))}
                        {commentsCount === 0 && (
                          <p className="text-center text-sm font-bold opacity-50 uppercase py-4">No comments yet. Be the first!</p>
                        )}
                      </div>

                      {/* Add Comment Form */}
                      {currentUser && (
                        <form 
                          onSubmit={(e) => handleCommentSubmit(e, activity.id)}
                          className="flex gap-2"
                        >
                          <input 
                            type="text"
                            value={commentText[activity.id] || ""}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [activity.id]: e.target.value }))}
                            placeholder="Add a comment..."
                            className="flex-1 bg-white border-4 border-black px-4 py-2 font-bold placeholder:opacity-50 focus:outline-none"
                          />
                          <button 
                            type="submit"
                            className="bg-black text-white p-2 border-4 border-black hover:bg-coral transition-colors"
                          >
                            <Send size={20} />
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </MemphisCard>
          );
        })}
        </div>
      </div>
    </div>
  );
}
