import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Star, Plus, ThumbsUp, ThumbsDown, AlertCircle, Filter, SortAsc, MessageCircle, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Review, ReviewFormData, SortOption, FilterOption, CommentFormData, Comment } from "@/types/reviews";
import { useReviews } from "@/hooks/use-reviews";
import { useComments } from "@/hooks/use-comments";
import CommentSection from "@/components/CommentSection";
import { useVoiceNavigationContext } from "@/components/VoiceNavigationProvider";
import { useVoiceShortcuts } from "@/hooks/useVoiceShortcuts";


export default function Reviews() {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState([5]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [formData, setFormData] = useState<ReviewFormData>({
    serviceName: "",
    location: "",
    documents: "",
    extraDemands: "",
    pros: "",
    cons: "",
    authorName: ""
  });

  const { reviews, loading, addReview, voteOnReview, sortReviews, filterReviews, saveReviews } = useReviews();
  const { getTotalCommentCount } = useComments();
  const { speak } = useVoiceNavigationContext();

  // Voice shortcuts for Reviews page
  const { isListening, isSupported, startListening, stopListening } = useVoiceShortcuts({
    enabled: true,
    speak,
    shortcuts: [
      {
        patterns: ['add review', 'write review', 'new review', 'create review'],
        action: () => {
          setShowForm(true);
          speak('Opening review form. You can now voice your review.');
        },
        description: 'Open review form'
      },
      {
        patterns: ['cancel', 'close form', 'cancel review'],
        action: () => {
          setShowForm(false);
          speak('Review form closed.');
        },
        description: 'Close review form'
      },
      {
        patterns: ['sort by newest', 'newest first', 'sort newest'],
        action: () => {
          setSortBy('newest');
          speak('Sorting reviews by newest first.');
        },
        description: 'Sort by newest reviews'
      },
      {
        patterns: ['sort by oldest', 'oldest first', 'sort oldest'],
        action: () => {
          setSortBy('oldest');
          speak('Sorting reviews by oldest first.');
        },
        description: 'Sort by oldest reviews'
      },
      {
        patterns: ['sort by rating', 'sort by highest rated', 'best reviews'],
        action: () => {
          setSortBy('rating');
          speak('Sorting reviews by highest rating.');
        },
        description: 'Sort by rating'
      },
      {
        patterns: ['show all reviews', 'filter all', 'show everything'],
        action: () => {
          setFilterBy('all');
          speak('Showing all reviews.');
        },
        description: 'Show all reviews'
      },
      {
        patterns: ['show positive reviews', 'filter positive', 'good reviews only'],
        action: () => {
          setFilterBy('positive');
          speak('Showing only positive reviews.');
        },
        description: 'Filter positive reviews'
      },
      {
        patterns: ['show negative reviews', 'filter negative', 'bad reviews only'],
        action: () => {
          setFilterBy('negative');
          speak('Showing only negative reviews.');
        },
        description: 'Filter negative reviews'
      }
    ]
  });

  const filteredAndSortedReviews = sortReviews(filterReviews(reviews, filterBy), sortBy);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReview(formData, rating[0]);
    setShowForm(false);
    setFormData({
      serviceName: "",
      location: "",
      documents: "",
      extraDemands: "",
      pros: "",
      cons: "",
      authorName: ""
    });
    setRating([5]);
  };

  const handleCommentsUpdate = (reviewId: string, comments: Comment[]) => {
    const updatedReviews = reviews.map(review =>
      review.id === reviewId ? { ...review, comments } : review
    );
    saveReviews(updatedReviews);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-success";
    if (rating >= 6) return "text-financial";
    return "text-destructive";
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 8) return "Good";
    if (rating >= 6) return "Average";
    return "Poor";
  };

  if (showForm) {
    return (
      <div className="min-h-screen p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Submit Review</h1>
          <Button onClick={() => setShowForm(false)} variant="outline" size="sm">
            Cancel
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Rate Government Service</CardTitle>
            <CardDescription>Help others by sharing your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Select 
                  value={formData.serviceName} 
                  onValueChange={(value) => setFormData({ ...formData, serviceName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ration-card">Ration Card</SelectItem>
                    <SelectItem value="voter-id">Voter ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="driving-license">Driving License</SelectItem>
                    <SelectItem value="pan-card">PAN Card</SelectItem>
                    <SelectItem value="birth-certificate">Birth Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Office Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Block Office, City Name"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents">Required Documents</Label>
                <Input
                  id="documents"
                  placeholder="List documents needed (comma separated)"
                  value={formData.documents}
                  onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extraDemands">Extra Demands/Bribes</Label>
                <Textarea
                  id="extraDemands"
                  placeholder="Any extra money or favors asked? Write 'None' if process was clean"
                  value={formData.extraDemands}
                  onChange={(e) => setFormData({ ...formData, extraDemands: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Overall Rating: {rating[0]}/10</Label>
                <Slider
                  value={rating}
                  onValueChange={setRating}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pros">What went well?</Label>
                <Textarea
                  id="pros"
                  placeholder="Positive aspects of your experience"
                  value={formData.pros}
                  onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cons">What could be improved?</Label>
                <Textarea
                  id="cons"
                  placeholder="Issues or problems you faced"
                  value={formData.cons}
                  onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorName">Your Name</Label>
                <Input
                  id="authorName"
                  placeholder="Your name (optional)"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-success hover:opacity-90"
                disabled={!formData.serviceName || !formData.location || !formData.authorName}
              >
                Submit Review
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Reviews</h1>
          <p className="text-muted-foreground">Real experiences from people like you</p>
        </div>
        <div className="flex items-center space-x-2">
          {isSupported && (
            <Button
              type="button"
              variant={isListening ? "default" : "outline"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              className={isListening ? "bg-financial text-financial-foreground animate-pulse" : ""}
            >
              <Mic className="h-4 w-4 mr-1" />
              {isListening ? "Stop" : "Voice"}
            </Button>
          )}
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-success hover:opacity-90"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Review
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="ration-card">Ration Card</SelectItem>
              <SelectItem value="voter-id">Voter ID</SelectItem>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="driving-license">Driving License</SelectItem>
              <SelectItem value="pan-card">PAN Card</SelectItem>
              <SelectItem value="birth-certificate">Birth Certificate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest-rated">Highest Rated</SelectItem>
              <SelectItem value="lowest-rated">Lowest Rated</SelectItem>
              <SelectItem value="most-helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Loading reviews...</p>
        </div>
      )}

      <div className="space-y-4">
        {filteredAndSortedReviews.map((review) => (
          <Card key={review.id} className="shadow-card border-l-4 border-l-success">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{review.serviceName}</CardTitle>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", getRatingColor(review.rating))}
                    >
                      {review.rating}/10 • {getRatingBadge(review.rating)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                    {review.authorName && review.authorName !== 'Anonymous User' && (
                      <Badge variant="outline" className="text-xs">
                        by {review.authorName}
                      </Badge>
                    )}
                    {getTotalCommentCount(review.comments) > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {getTotalCommentCount(review.comments)} comments
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => voteOnReview(review.id, 'helpful')}
                      className={cn(
                        "h-7 px-2 text-xs",
                        review.userVote === 'helpful' && "bg-success/10 text-success"
                      )}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {review.votes.helpful}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => voteOnReview(review.id, 'notHelpful')}
                      className={cn(
                        "h-7 px-2 text-xs",
                        review.userVote === 'notHelpful' && "bg-destructive/10 text-destructive"
                      )}
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      {review.votes.notHelpful}
                    </Button>
                  </div>
                  <Star className="h-5 w-5 text-financial" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Location:</p>
                <p className="text-sm">{review.location}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Documents needed:</p>
                <div className="flex flex-wrap gap-1">
                  {review.documents.map((doc, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>

              {review.extraDemands && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Extra Demands:</p>
                      <p className="text-sm text-destructive/80">{review.extraDemands}</p>
                    </div>
                  </div>
                </div>
              )}

              {review.pros && (
                <div className="flex items-start space-x-2">
                  <ThumbsUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-success">Positives:</p>
                    <p className="text-sm text-muted-foreground">{review.pros}</p>
                  </div>
                </div>
              )}

              {review.cons && (
                <div className="flex items-start space-x-2">
                  <ThumbsDown className="h-4 w-4 text-financial mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-financial">Areas for improvement:</p>
                    <p className="text-sm text-muted-foreground">{review.cons}</p>
                  </div>
                </div>
              )}

              <CommentSection
                comments={review.comments}
                onCommentsUpdate={(comments) => handleCommentsUpdate(review.id, comments)}
                reviewId={review.id}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}