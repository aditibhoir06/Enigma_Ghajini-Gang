import { Comment, CommentFormData } from '@/types/reviews';

export const useComments = () => {
  const addComment = (
    comments: Comment[],
    formData: CommentFormData,
    parentId?: string
  ): Comment[] => {
    const newComment: Comment = {
      id: Date.now().toString(),
      ...formData,
      date: new Date().toISOString().split('T')[0],
      replies: [],
      votes: { helpful: 0, notHelpful: 0 }
    };

    if (parentId) {
      return addReplyToComment(comments, parentId, newComment);
    }

    return [newComment, ...comments];
  };

  const addReplyToComment = (
    comments: Comment[],
    parentId: string,
    reply: Comment
  ): Comment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [reply, ...comment.replies]
        };
      }
      if (comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, parentId, reply)
        };
      }
      return comment;
    });
  };

  const voteOnComment = (
    comments: Comment[],
    commentId: string,
    voteType: 'helpful' | 'notHelpful'
  ): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        const currentVote = comment.userVote;
        const newVotes = { ...comment.votes };

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
          ...comment,
          votes: newVotes,
          userVote: newUserVote
        };
      }
      if (comment.replies.length > 0) {
        return {
          ...comment,
          replies: voteOnComment(comment.replies, commentId, voteType)
        };
      }
      return comment;
    });
  };

  const getTotalCommentCount = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + getTotalCommentCount(comment.replies);
    }, 0);
  };

  return {
    addComment,
    voteOnComment,
    getTotalCommentCount
  };
};