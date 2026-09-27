# Asynchronous Processing Architecture

## 1. Overview

To ensure high availability and responsiveness, the platform relies heavily on background processing for resource-intensive tasks. This document outlines the event-driven queue topology.

## 2. Queue Topology (Target: Phase 05/06/07)

```mermaid
flowchart LR
    API["API Gateway"]

    subgraph Queues (Redis/BullMQ)
        Q_Analyze["Q: ai_analyze"]
        Q_Render["Q: video_render"]
        Q_QC["Q: quality_control"]
        Q_Publish["Q: social_publish"]
    end

    subgraph Workers
        W_AI["AI Worker Pool"]
        W_Video["Video Worker Pool"]
        W_QC["QC Worker Pool"]
        W_Publish["Publish Worker Pool"]
    end

    API -->|Submit| Q_Analyze
    Q_Analyze --> W_AI

    W_AI -->|Submit| Q_Render
    Q_Render --> W_Video

    W_Video -->|Submit| Q_QC
    Q_QC --> W_QC

    W_QC -->|Update Status| API

    API -->|Approve & Schedule| Q_Publish
    Q_Publish --> W_Publish
```

## 3. Workflow State Machine

The progression of a video project is governed by a strict state machine, advanced by worker completion events:

1. **UPLOADED**: Raw media is in S3. Job sent to `ai_analyze`.
2. **ANALYZING**: Gemini is processing the video for punchlines and metadata.
3. **RENDERING**: OpenShorts is compositing the 9:16 vertical video.
4. **QC_CHECKING**: Automated checks for aspect ratio, duration, and audio clipping.
5. **REVIEW_PENDING**: System awaits human creator approval via the dashboard.
6. **SCHEDULED**: Approved; waiting for publication time.
7. **PUBLISHED**: Successfully distributed to social platforms.

## 4. Resilience & Error Handling

- **Idempotency**: All worker jobs must be idempotent. If a rendering job fails midway, restarting it should cleanly overwrite or generate a new unique output without corrupting state.
- **Exponential Backoff**: Transient errors (e.g., API rate limits from Gemini or YouTube) automatically trigger retries with exponential backoff.
- **Dead Letter Queue (DLQ)**: Jobs failing beyond the maximum retry limit are routed to a DLQ for manual inspection.
