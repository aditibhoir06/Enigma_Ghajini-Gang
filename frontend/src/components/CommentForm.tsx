import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CommentFormData } from "@/types/reviews";

interface CommentFormProps {
  onSubmit: (formData: CommentFormData) => void;
  onCancel?: () => void;
  placeholder?: string;
  isReply?: boolean;
}

export default function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "Share your thoughts or experience...",
  isReply = false
}: CommentFormProps) {
  const [formData, setFormData] = useState<CommentFormData>({
    text: "",
    authorName: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.text.trim() && formData.authorName.trim()) {
      onSubmit(formData);
      setFormData({ text: "", authorName: "" });
    }
  };

  return (
    <Card className={`shadow-sm ${isReply ? 'ml-6 border-l-2 border-l-primary' : ''}`}>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="authorName" className="text-sm">
              Name
            </Label>
            <Input
              id="authorName"
              placeholder="Your name"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm">
              {isReply ? "Reply" : "Comment"}
            </Label>
            <Textarea
              id="comment"
              placeholder={placeholder}
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              required
              rows={isReply ? 2 : 3}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="submit"
              size="sm"
              className="bg-gradient-success hover:opacity-90"
              disabled={!formData.text.trim() || !formData.authorName.trim()}
            >
              {isReply ? "Reply" : "Post Comment"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}