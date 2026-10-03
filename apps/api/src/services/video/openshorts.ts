import {
  VideoProcessorProvider,
  VideoProcessingJobOptions,
  VideoProcessingJobResult,
  JobStatusResult,
  VideoProcessorError,
  ProviderNotConfiguredError,
} from './provider.js';

interface OpenShortsProcessResponse {
  job_id: string;
}

interface OpenShortsLog {
  message: string;
}

interface OpenShortsClip {
  id?: string;
  index?: number;
  title?: string;
  duration?: number;
  video_url?: string;
  thumbnail_url?: string;
}

interface OpenShortsStatusResponse {
  status: string;
  logs?: OpenShortsLog[];
  result?: {
    clips?: OpenShortsClip[];
  };
}

export class OpenShortsProvider implements VideoProcessorProvider {
  constructor(
    private readonly apiKey: string | undefined,
    private readonly apiUrl: string = 'https://api.openshorts.app',
  ) {}

  private checkConfig() {
    if (!this.apiKey) {
      throw new ProviderNotConfiguredError('OpenShorts');
    }
  }

  async submitJob(options: VideoProcessingJobOptions): Promise<VideoProcessingJobResult> {
    this.checkConfig();
    try {
      const payload: Record<string, string | boolean> = {
        url: options.sourceUrl,
        acknowledged: true,
      };
      if (options.webhookUrl) {
        payload.webhook_url = options.webhookUrl;
      }
      if (options.webhookSecret) {
        payload.webhook_secret = options.webhookSecret;
      }

      const response = await fetch(`${this.apiUrl}/api/process`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(
          `[OpenShortsProvider] submitJob error: ${response.status} ${response.statusText}`,
        );
        throw new VideoProcessorError(
          'Video processing is temporarily unavailable.',
          'PROVIDER_ERROR',
        );
      }

      const data = (await response.json()) as OpenShortsProcessResponse;

      const providerJobId = data.job_id;
      if (!providerJobId) {
        throw new VideoProcessorError('Failed to extract job ID from response', 'PROVIDER_ERROR');
      }

      return {
        providerJobId: String(providerJobId),
      };
    } catch (error) {
      if (error instanceof VideoProcessorError) throw error;
      console.error(`[OpenShortsProvider] submitJob failed`);
      throw new VideoProcessorError('Failed to submit job', 'PROVIDER_ERROR');
    }
  }

  async getJobStatus(providerJobId: string): Promise<JobStatusResult> {
    this.checkConfig();
    try {
      const response = await fetch(`${this.apiUrl}/api/status/${providerJobId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        console.error(
          `[OpenShortsProvider] getJobStatus error: ${response.status} ${response.statusText}`,
        );
        throw new VideoProcessorError(
          'Video processing is temporarily unavailable.',
          'PROVIDER_ERROR',
        );
      }

      const data = (await response.json()) as OpenShortsStatusResponse;

      const status = data.status;
      let mappedStatus: JobStatusResult['status'];

      if (status === 'queued') {
        mappedStatus = 'queued';
      } else if (status === 'processing') {
        mappedStatus = 'processing';
      } else if (status === 'completed') {
        mappedStatus = 'completed';
      } else if (status === 'failed') {
        mappedStatus = 'failed';
      } else if (status === 'canceled') {
        mappedStatus = 'canceled';
      } else {
        throw new VideoProcessorError(`Unknown provider status: ${status}`, 'PROVIDER_ERROR');
      }

      const clips = Array.isArray(data.result?.clips)
        ? data.result!.clips!.map((clip, index) => {
            // Deterministic ID fallback
            let providerClipId = clip.id;
            if (!providerClipId) {
              providerClipId =
                typeof clip.index !== 'undefined'
                  ? `clip_${providerJobId}_${clip.index}`
                  : `clip_${providerJobId}_${index}`;
            }

            return {
              providerClipId,
              title: clip.title,
              durationSeconds: clip.duration ? Number(clip.duration) : undefined,
              videoUrl: clip.video_url,
              thumbnailUrl: clip.thumbnail_url,
            };
          })
        : [];

      return {
        status: mappedStatus,
        clips,
      };
    } catch (error) {
      if (error instanceof VideoProcessorError) throw error;
      console.error(`[OpenShortsProvider] getJobStatus failed`);
      throw new VideoProcessorError('Failed to get job status', 'PROVIDER_ERROR');
    }
  }
}
