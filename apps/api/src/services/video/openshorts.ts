import {
  VideoProcessorProvider,
  VideoProcessingJobOptions,
  VideoProcessingJobResult,
  JobStatusResult,
  VideoProcessorError,
  ProviderNotConfiguredError,
} from './provider.js';

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
      const formData = new FormData();
      formData.append('url', options.sourceUrl);
      if (options.webhookUrl) {
        formData.append('webhook_url', options.webhookUrl);
      }
      if (options.webhookSecret) {
        formData.append('webhook_secret', options.webhookSecret);
      }
      
      const response = await fetch(`${this.apiUrl}/api/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[OpenShortsProvider] submitJob error: ${response.status} ${response.statusText} - ${errorText}`);
        throw new VideoProcessorError('Video processing is temporarily unavailable.', 'PROVIDER_ERROR');
      }

      const data = await response.json() as any;
      
      const providerJobId = data.job_id || data.id;
      if (!providerJobId) {
        throw new Error(`Failed to extract job ID from response: ${JSON.stringify(data)}`);
      }

      return {
        providerJobId: String(providerJobId),
      };
    } catch (error) {
      if (error instanceof VideoProcessorError) throw error;
      console.error(`[OpenShortsProvider] submitJob failed:`, error);
      throw new VideoProcessorError('Failed to submit job', 'PROVIDER_ERROR');
    }
  }

  async getJobStatus(providerJobId: string): Promise<JobStatusResult> {
    this.checkConfig();
    try {
      const response = await fetch(`${this.apiUrl}/api/status/${providerJobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[OpenShortsProvider] getJobStatus error: ${response.status} ${response.statusText} - ${errorText}`);
        throw new VideoProcessorError('Video processing is temporarily unavailable.', 'PROVIDER_ERROR');
      }

      const data = await response.json() as any;
      
      const status = typeof data.status === 'string' ? data.status.toLowerCase() : '';
      let mappedStatus: JobStatusResult['status'] = 'queued';
      
      if (status === 'processing') {
        mappedStatus = 'processing';
      } else if (status === 'completed' || status === 'done' || status === 'success') {
        mappedStatus = 'completed';
      } else if (status === 'failed' || status === 'error') {
        mappedStatus = 'failed';
      } else if (status === 'canceled' || status === 'cancelled') {
        mappedStatus = 'canceled';
      }

      const clips = Array.isArray(data.clips) ? data.clips.map((clip: any, index: number) => {
        // Deterministic ID fallback
        let providerClipId = String(clip.id || clip.index || '');
        if (!providerClipId) {
          providerClipId = `clip_${providerJobId}_${index}`;
        }
        
        return {
          providerClipId,
          title: clip.title,
          durationSeconds: clip.duration ? Number(clip.duration) : undefined,
          videoUrl: clip.video_url || clip.url,
          thumbnailUrl: clip.thumbnail_url || clip.thumbnail,
        };
      }) : [];

      return {
        status: mappedStatus,
        clips,
        error: typeof data.error === 'string' ? data.error : undefined,
      };
    } catch (error) {
      if (error instanceof VideoProcessorError) throw error;
      console.error(`[OpenShortsProvider] getJobStatus failed:`, error);
      throw new VideoProcessorError('Failed to get job status', 'PROVIDER_ERROR');
    }
  }
}
