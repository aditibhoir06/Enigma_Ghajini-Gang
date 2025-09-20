import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Reply, MessageCircle } from "lucide-react";
import { Comment as CommentType, CommentFormData } from "@/types/reviews";
import { cn } from "@/lib/utils";
import CommentForm from "./CommentForm";

interface CommentProps {
  comment: CommentType;
  onReply: (parentId: string, formData: CommentFormData) => void;
  onVote: (commentId: string, voteType: 'helpful' | 'notHelpful') => void;
  depth?: number;
}

export default function Comment({ comment, onReply, onVote, depth = 0 }: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReply = (formData: CommentFormData) => {
    onReply(comment.id, formData);
    setShowReplyForm(false);
  };

  const handleVote = (voteType: 'helpful' | 'notHelpful') => {
    onVote(comment.id, voteType);
  };

  const isVoted = (voteType: 'helpful' | 'notHelpful') => {
    return comment.userVote === voteType;
  };

  return (
    <div className={cn(
      "space-y-3",
      depth > 0 && "ml-6 border-l-2 border-l-muted pl-4"
    )}>
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{comment.authorName}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {comment.text}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('helpful')}
              className={cn(
                "h-7 px-2 text-xs",
                isVoted('helpful') && "bg-success/10 text-success"
              )}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {comment.votes.helpful}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('notHelpful')}
              className={cn(
                "h-7 px-2 text-xs",
                isVoted('notHelpful') && "bg-destructive/10 text-destructive"
              )}
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              {comment.votes.notHelpful}
            </Button>
          </div>

          {depth < 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-7 px-2 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}

          {comment.replies.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </Badge>
          )}
        </div>

        {showReplyForm && (
          <div className="pt-2">
            <CommentForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${comment.authorName}...`}
              isReply={true}
            />
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onVote={onVote}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}