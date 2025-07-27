
// --- Type Definitions ---
export interface User {
  id: string;
  username: string;
  profile_picture_url: string;
  bio: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  project_url: string;
  image_url: string;
  created_at?: string;
}

export interface Follow {
  follower_id: string;
  followee_id: string;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at?: string;
}

export interface Like {
    id?: number;
    user_id: string;
    project_id: string;
}
