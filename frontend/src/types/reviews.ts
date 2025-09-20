export interface Comment {
  id: string;
  authorName: string;
  text: string;
  date: string;
  replies: Comment[];
  votes: {
    helpful: number;
    notHelpful: number;
  };
  userVote?: 'helpful' | 'notHelpful' | null;
}

export interface Review {
  id: string;
  serviceName: string;
  rating: number;
  location: string;
  documents: string[];
  extraDemands: string;
  pros: string;
  cons: string;
  date: string;
  authorName: string;
  comments: Comment[];
  votes: {
    helpful: number;
    notHelpful: number;
  };
  userVote?: 'helpful' | 'notHelpful' | null;
}

export interface ReviewFormData {
  serviceName: string;
  location: string;
  documents: string;
  extraDemands: string;
  pros: string;
  cons: string;
  authorName: string;
}

export interface CommentFormData {
  text: string;
  authorName: string;
}

export type SortOption = 'newest' | 'oldest' | 'highest-rated' | 'lowest-rated' | 'most-helpful';
export type FilterOption = 'all' | 'ration-card' | 'voter-id' | 'passport' | 'driving-license' | 'pan-card' | 'birth-certificate';