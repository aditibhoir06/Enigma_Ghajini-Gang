import { useState, useEffect } from 'react';
import { Review, ReviewFormData, SortOption, FilterOption } from '@/types/reviews';

const STORAGE_KEY = 'sachivji-reviews';

const mockReviews: Review[] = [
  {
    id: '1',
    serviceName: 'Ration Card Application',
    rating: 7,
    location: 'Block Office, Patna',
    documents: ['Address Proof', 'Income Certificate', 'Photos'],
    extraDemands: 'Asked for ₹200 extra for \'faster processing\'',
    pros: 'Process was quick once documents were submitted',
    cons: 'Had to visit multiple times, unclear requirements',
    date: '2024-01-15',
    authorName: 'Anonymous User',
    comments: [
      {
        id: 'c1',
        authorName: 'Rajesh Kumar',
        text: 'Same experience here! They asked for extra money even though it\'s supposed to be free.',
        date: '2024-01-16',
        replies: [
          {
            id: 'c1-r1',
            authorName: 'Priya Singh',
            text: 'You should report this to the anti-corruption helpline',
            date: '2024-01-17',
            replies: [],
            votes: { helpful: 5, notHelpful: 0 }
          }
        ],
        votes: { helpful: 8, notHelpful: 1 }
      }
    ],
    votes: { helpful: 12, notHelpful: 2 }
  },
  {
    id: '2',
    serviceName: 'Voter ID Registration',
    rating: 8,
    location: 'Tehsil Office, Mumbai',
    documents: ['Age Proof', 'Address Proof'],
    extraDemands: 'None - followed proper procedure',
    pros: 'Staff was helpful, clear process',
    cons: 'Long waiting time due to rush',
    date: '2024-01-10',
    authorName: 'Anonymous User',
    comments: [],
    votes: { helpful: 6, notHelpful: 0 }
  }
];

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setReviews(JSON.parse(stored));
    } else {
      setReviews(mockReviews);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockReviews));
    }
    setLoading(false);
  }, []);

  const saveReviews = (newReviews: Review[]) => {
    setReviews(newReviews);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReviews));
  };

  const addReview = (formData: ReviewFormData, rating: number) => {
    const newReview: Review = {
      id: Date.now().toString(),
      ...formData,
      rating,
      documents: formData.documents.split(',').map(d => d.trim()),
      date: new Date().toISOString().split('T')[0],
      comments: [],
      votes: { helpful: 0, notHelpful: 0 }
    };

    const newReviews = [newReview, ...reviews];
    saveReviews(newReviews);
    return newReview;
  };

  const voteOnReview = (reviewId: string, voteType: 'helpful' | 'notHelpful') => {
    const newReviews = reviews.map(review => {
      if (review.id === reviewId) {
        const currentVote = review.userVote;
        const newVotes = { ...review.votes };

        // Remove previous vote if exists
        if (currentVote === 'helpful') newVotes.helpful--;
        if (currentVote === 'notHelpful') newVotes.notHelpful--;

        // Add new vote if different from current
        let newUserVote: 'helpful' | 'notHelpful' | null = null;
        if (currentVote !== voteType) {
          newVotes[voteType]++;
          newUserVote = voteType;
        }

        return {
          ...review,
          votes: newVotes,
          userVote: newUserVote
        };
      }
      return review;
    });

    saveReviews(newReviews);
  };

  const sortReviews = (reviews: Review[], sortBy: SortOption): Review[] => {
    return [...reviews].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest-rated':
          return b.rating - a.rating;
        case 'lowest-rated':
          return a.rating - b.rating;
        case 'most-helpful':
          return b.votes.helpful - a.votes.helpful;
        default:
          return 0;
      }
    });
  };

  const filterReviews = (reviews: Review[], filterBy: FilterOption): Review[] => {
    if (filterBy === 'all') return reviews;
    return reviews.filter(review => review.serviceName.toLowerCase().includes(filterBy.replace('-', ' ')));
  };

  return {
    reviews,
    loading,
    addReview,
    voteOnReview,
    sortReviews,
    filterReviews,
    saveReviews
  };
};