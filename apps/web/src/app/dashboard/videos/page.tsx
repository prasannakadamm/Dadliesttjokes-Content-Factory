'use client';

import { useState } from 'react';
import { fetchApi } from '../../../lib/api';

type Clip = {
  id: string;
  title: string | null;
  durationSeconds: number | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
};

type JobData = {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'canceled';
  sourceUrl: string;
  createdAt: string;
  error?: string | null;
  clips?: Clip[];
};

export default function VideosPage() {
  const [sourceUrl, setSourceUrl] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceUrl) return;

    setLoading(true);
    setError(null);
    setJobId(null);
    setJobData(null);

    try {
      const data = await fetchApi<{ jobId: string; status: string }>('/video/jobs', {
        method: 'POST',
        body: JSON.stringify({ sourceUrl }),
      });

      setJobId(data.jobId);
      pollJob(data.jobId);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  const pollJob = async (id: string) => {
    try {
      const data = await fetchApi<JobData>(`/video/jobs/${id}`);
      
      setJobData(data);
      
      if (data.status === 'queued' || data.status === 'processing') {
        setTimeout(() => pollJob(id), 5000); // poll every 5s
      }
    } catch (err) {
      console.error('Failed to poll job status', err);
      setTimeout(() => pollJob(id), 10000); // retry polling after 10s on error
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Video Processing</h1>
        <p className="text-muted">Process full-length videos into shorts.</p>
      </div>

      <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="flex-1 rounded-md bg-background border border-border px-4 py-2 text-white focus:border-white focus:outline-none"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !sourceUrl}
            className="rounded-md bg-white text-black px-6 py-2 font-medium hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Process Video'}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      {jobId && !jobData && (
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm text-center">
          <p className="text-muted">Loading job status...</p>
        </div>
      )}

      {jobData && (
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-medium text-white mb-1">Job Status</h2>
              <p className="text-sm text-muted break-all">{jobData.sourceUrl}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
              ${jobData.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                jobData.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                jobData.status === 'canceled' ? 'bg-gray-500/10 text-gray-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
              {jobData.status}
            </span>
          </div>

          {jobData.error && (
            <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500">Error: {jobData.error}</p>
            </div>
          )}

          {jobData.clips && jobData.clips.length > 0 && (
            <div className="pt-4 border-t border-border">
              <h3 className="text-md font-medium text-white mb-4">Generated Clips</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jobData.clips.map((clip, idx) => (
                  <div key={clip.id} className="border border-border rounded-md overflow-hidden bg-background">
                    {clip.thumbnailUrl ? (
                      <img src={clip.thumbnailUrl} alt={clip.title || 'Clip thumbnail'} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-border/50 flex items-center justify-center">
                        <span className="text-muted text-sm">No Thumbnail</span>
                      </div>
                    )}
                    <div className="p-3 space-y-2">
                      <p className="text-sm text-white font-medium line-clamp-2">{clip.title || `Clip ${idx + 1}`}</p>
                      <div className="flex justify-between items-center text-xs text-muted">
                        <span>{clip.durationSeconds ? `${clip.durationSeconds}s` : 'Unknown duration'}</span>
                        {clip.videoUrl && (
                          <a href={clip.videoUrl} target="_blank" rel="noreferrer" className="text-white hover:underline">
                            View Video
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
