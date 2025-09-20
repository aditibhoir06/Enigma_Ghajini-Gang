import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus } from "lucide-react";
import { Comment as CommentType, CommentFormData } from "@/types/reviews";
import { useComments } from "@/hooks/use-comments";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

interface CommentSectionProps {
  comments: CommentType[];
  onCommentsUpdate: (comments: CommentType[]) => void;
  reviewId: string;
}

export default function CommentSection({
  comments,
  onCommentsUpdate,
  reviewId
}: CommentSectionProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { addComment, voteOnComment, getTotalCommentCount } = useComments();

  const totalComments = getTotalCommentCount(comments);

  const handleAddComment = (formData: CommentFormData) => {
    const updatedComments = addComment(comments, formData);
    onCommentsUpdate(updatedComments);
    setShowCommentForm(false);
  };

  const handleReply = (parentId: string, formData: CommentFormData) => {
    const updatedComments = addComment(comments, formData, parentId);
    onCommentsUpdate(updatedComments);
  };

  const handleVote = (commentId: string, voteType: 'helpful' | 'notHelpful') => {
    const updatedComments = voteOnComment(comments, commentId, voteType);
    onCommentsUpdate(updatedComments);
  };

  return (
    <div className="space-y-4 mt-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-sm">Comments</h3>
          {totalComments > 0 && (
            <Badge variant="outline" className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              {totalComments}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Comment
        </Button>
      </div>

      {showCommentForm && (
        <CommentForm
          onSubmit={handleAddComment}
          onCancel={() => setShowCommentForm(false)}
        />
      )}

      {comments.length === 0 && !showCommentForm && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            onVote={handleVote}
          />
        ))}
      </div>
    </div>
  );
}