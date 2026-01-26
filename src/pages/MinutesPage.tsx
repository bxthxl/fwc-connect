import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MinutesCard } from '@/components/minutes/MinutesCard';
import { MinutesViewer } from '@/components/minutes/MinutesViewer';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { useMinutes, useMinutesById, MinutesWithMeeting } from '@/hooks/useMinutes';
import { FileText, Search } from 'lucide-react';

export default function MinutesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMinutes, setSelectedMinutes] = useState<MinutesWithMeeting | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: minutesList, isLoading } = useMinutes();
  const initialMinutesId = searchParams.get('id');
  const { data: initialMinutes } = useMinutesById(initialMinutesId || undefined);

  // Open viewer if URL has minutes ID
  useEffect(() => {
    if (initialMinutes) {
      setSelectedMinutes(initialMinutes);
      setViewerOpen(true);
      // Clear the URL param after opening
      setSearchParams({});
    }
  }, [initialMinutes, setSearchParams]);

  const handleMinutesClick = (minutes: MinutesWithMeeting) => {
    setSelectedMinutes(minutes);
    setViewerOpen(true);
  };

  // Filter minutes by search term
  const filteredMinutes = minutesList?.filter((m) =>
    m.meetings.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meeting Minutes</h1>
          <p className="text-muted-foreground">Read published meeting minutes</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search minutes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : filteredMinutes && filteredMinutes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMinutes.map((minutes) => (
              <MinutesCard
                key={minutes.id}
                minutes={minutes}
                onClick={() => handleMinutesClick(minutes)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title={searchTerm ? 'No matching minutes' : 'No minutes available'}
            description={
              searchTerm
                ? 'Try adjusting your search term'
                : 'Published meeting minutes will appear here'
            }
          />
        )}

        <MinutesViewer
          minutes={selectedMinutes}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      </div>
    </DashboardLayout>
  );
}
