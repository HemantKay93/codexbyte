import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Badge,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Star, MessageSquare, Check, X, Search, Filter, Loader2, RefreshCcw } from 'lucide-react';
import { useAdminStore } from '@byteevolvr/store';
import { ReviewService } from '@byteevolvr/api-client';

export function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(false);
  const { setError } = useAdminStore();
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-line @typescript-eslint/no-floating-promises
  }, []);
  // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchReviews() {
    setLoading(true);
    try {
      const data = await ReviewService.getAllReviews();
      setReviews(data || []);
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Error fetching reviews:', err);
      setError(err.customMessage || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  const updateReviewStatus = async (id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      await ReviewService.updateReviewStatus(id, newStatus);
      await fetchReviews();
    } catch (err) {
      console.error('Error updating review status:', err);
      alert('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-outline-variant'}`}
        />
      ));
  };

  const filteredReviews = reviews.filter(
    (r) =>
      (r.product?.name && r.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.comment && r.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.user?.full_name && r.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    avg:
      reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0',
    total: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Customer Reviews</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Moderate and respond to product reviews
          </p>
        </div>
        <Button variant="outline" onClick={fetchReviews} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="text-on-surface-variant font-medium text-sm mb-1">Average Rating</div>
              <div className="text-3xl font-bold text-on-surface flex items-center gap-2">
                {loading ? '...' : stats.avg}{' '}
                <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="text-on-surface-variant font-medium text-sm mb-1">Total Reviews</div>
              <div className="text-3xl font-bold text-on-surface">
                {loading ? '...' : stats.total}
              </div>
            </div>
          </div>
        </Card>
        <Card
          className={
            stats.pending > 0
              ? 'bg-warning-container border-warning-container text-on-warning-container'
              : ''
          }
        >
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm mb-1 opacity-90">Pending Moderation</div>
              <div className="text-3xl font-bold">{loading ? '...' : stats.pending}</div>
            </div>
            {stats.pending > 0 && (
              <Badge variant="warning" className="bg-warning text-on-warning">
                Action Needed
              </Badge>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search reviews or products..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating & Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <span className="text-sm text-on-surface-variant mt-2 block">
                      Loading reviews...
                    </span>
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-on-surface-variant">
                    No reviews found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id} className="items-start">
                    <TableCell className="align-top pt-4">
                      <div className="font-medium text-on-surface">
                        {review.user?.full_name || 'Anonymous'}
                      </div>
                    </TableCell>
                    <TableCell className="align-top pt-4">
                      <div className="text-primary hover:underline cursor-pointer font-medium text-sm">
                        {review.product?.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md py-4">
                      <div className="flex gap-1 mb-2">{renderStars(review.rating)}</div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        "{review.comment}"
                      </p>
                    </TableCell>
                    <TableCell className="align-top pt-4 text-on-surface-variant whitespace-nowrap text-sm">
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="align-top pt-4">
                      <Badge
                        variant={
                          review.status === 'approved'
                            ? 'success'
                            : review.status === 'flagged'
                              ? 'error'
                              : 'warning'
                        }
                      >
                        {(review.status || 'pending').charAt(0).toUpperCase() +
                          (review.status || 'pending').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top pt-4 text-right">
                      <div className="flex justify-end gap-2">
                        {review.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-success bg-success/10 hover:bg-success/20"
                              onClick={() => updateReviewStatus(review.id, 'approved')}
                              disabled={processingId === review.id}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-error bg-error/10 hover:bg-error/20"
                              onClick={() => updateReviewStatus(review.id, 'rejected')}
                              disabled={processingId === review.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                          <MessageSquare className="h-4 w-4" /> Reply
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
