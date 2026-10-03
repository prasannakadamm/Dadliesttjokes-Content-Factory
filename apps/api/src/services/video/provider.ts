export interface VideoProcessingJobOptions {
  sourceUrl: string;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface VideoProcessingJobResult {
  providerJobId: string;
}

export interface VideoClipResult {
  providerClipId: string;
  title?: string;
  durationSeconds?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface JobStatusResult {
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'canceled';
  clips: VideoClipResult[];
  error?: string;
}

export interface VideoProcessorProvider {
  submitJob(options: VideoProcessingJobOptions): Promise<VideoProcessingJobResult>;
  getJobStatus(providerJobId: string): Promise<JobStatusResult>;
}

export class VideoProcessorError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'VideoProcessorError';
  }
}

export class ProviderNotConfiguredError extends VideoProcessorError {
  constructor(providerName: string) {
    super(`Video provider '${providerName}' is not configured.`);
    this.name = 'ProviderNotConfiguredError';
  }
}
