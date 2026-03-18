export interface Comment {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface ExerciseEntry {
  id: string;
  userId: string;
  userName: string;
  type: string;
  duration: number; // in minutes
  calories?: number;
  timestamp: number;
  likes?: string[]; // userIds
  comments?: Comment[];
}

export interface WeightEntry {
  id: string;
  userId: string;
  userName: string;
  weight: number;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
}
