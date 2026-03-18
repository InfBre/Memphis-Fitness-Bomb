import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, addDoc, setDoc, doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import LogForm from "./components/LogForm";
import Social from "./components/Social";
import MonthlyReport from "./components/MonthlyReport";
import GeometricBackground from "./components/GeometricBackground";
import ErrorBoundary from "./components/ErrorBoundary";
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from "./firebase";
import { ExerciseEntry, WeightEntry } from "./types";

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            setDoc(userRef, {
              uid: firebaseUser.uid,
              displayName: "KKii",
              photoURL: firebaseUser.photoURL || "",
              role: "user"
            });
          }
        });
      } else {
        setUserProfile(null);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    // ... (rest of the existing useEffect for exercises and weights)

    // Listen for exercises
    const exercisesQuery = query(collection(db, "exercises"), orderBy("timestamp", "desc"));
    const unsubscribeExercises = onSnapshot(exercisesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExerciseEntry));
      setExercises(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "exercises");
    });

    // Listen for weights
    const weightsQuery = query(collection(db, "weights"), orderBy("timestamp", "desc"));
    const unsubscribeWeights = onSnapshot(weightsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeightEntry));
      setWeights(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "weights");
    });

    return () => {
      unsubscribeExercises();
      unsubscribeWeights();
    };
  }, [isAuthReady]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const addExercise = async (type: string, duration: number, timestamp: number, calories?: number) => {
    if (!user) return;
    const path = "exercises";
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        userName: userProfile?.displayName || user.displayName || "Anonymous",
        type,
        duration,
        calories: calories || 0,
        timestamp,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const addWeight = async (weight: number, timestamp: number) => {
    if (!user) return;
    const path = "weights";
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        userName: userProfile?.displayName || user.displayName || "Anonymous",
        weight,
        timestamp,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateProfileName = async (newName: string) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    try {
      await setDoc(userRef, { displayName: newName }, { merge: true });
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const deleteExercise = async (id: string) => {
    const path = "exercises";
    try {
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const deleteWeight = async (id: string) => {
    const path = "weights";
    try {
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleLike = async (activityId: string, isLiked: boolean) => {
    if (!user) return;
    const activityRef = doc(db, "exercises", activityId);
    try {
      await updateDoc(activityRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleAddComment = async (activityId: string, text: string) => {
    if (!user || !text.trim()) return;
    const activityRef = doc(db, "exercises", activityId);
    try {
      await updateDoc(activityRef, {
        comments: arrayUnion({
          userId: user.uid,
          userName: userProfile?.displayName || user.displayName || "Anonymous",
          text,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative overflow-hidden">
        <GeometricBackground />
        
        <Header 
          user={user} 
          profile={userProfile}
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          onUpdateName={updateProfileName}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="max-w-7xl mx-auto pb-4 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {activeTab === "dashboard" && (
                <Dashboard 
                  exercises={exercises} 
                  weights={weights} 
                  userId={user?.uid} 
                />
              )}
              {activeTab === "log" && (
                <LogForm 
                  exercises={exercises}
                  onAddExercise={addExercise} 
                  onAddWeight={addWeight} 
                  onDeleteExercise={deleteExercise}
                />
              )}
              {activeTab === "social" && (
                <Social 
                  recentActivities={exercises} 
                  currentUser={user}
                  onLike={handleLike}
                  onAddComment={handleAddComment}
                />
              )}
              {activeTab === "report" && (
                <MonthlyReport 
                  exercises={exercises} 
                  weights={weights} 
                  userId={user?.uid} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {!user && isAuthReady && activeTab !== "social" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border-8 border-black p-12 text-center rotate-2 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-5xl font-black uppercase mb-6 tracking-tighter">Welcome to <span className="text-coral">FITNESS BOMB</span></h2>
              <p className="text-xl font-bold mb-8 uppercase">Please login to start tracking your progress!</p>
              <button 
                onClick={handleLogin}
                className="px-12 py-4 bg-mint border-4 border-black text-2xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Login with Google
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
