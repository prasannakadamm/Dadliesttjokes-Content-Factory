# Component Architecture

## 1. Overview

This document details the internal structure and responsibilities of the primary functional components within the Dadliesttjokes Content Factory platform.

## 2. API Component Architecture (Phase 02)

The API layer is structured into modular domains using a layered architecture pattern.

```mermaid
flowchart TD
    subgraph API Application
        Router["HTTP Router / Controllers"]
        Services["Business Services (Domain Logic)"]
        Adapters["External Adapters (Storage, Queue)"]
        DAL["Data Access Layer (ORM / Queries)"]
    end

    Router --> Services
    Services --> DAL
    Services --> Adapters
    DAL --> DB[(PostgreSQL)]
    Adapters --> Queue[(Redis)]
    Adapters --> S3[(Object Storage)]
```

### 2.1 API Modules

- **Auth Module**: JWT issuing, verification, and role-based access control.
- **Media Module**: Presigned URL generation, upload lifecycle tracking.
- **Workflow Module**: Orchestrating the state machine of a video from 'Uploaded' to 'Published'.
- **Publisher Module**: Managing scheduled publication slots and profiles.

## 3. Worker Component Architecture (Phase 05/06)

The background worker cluster is built to consume targeted queues and execute specialized pipelines.

```mermaid
flowchart TD
    subgraph Worker Cluster
        Dispatcher["Job Dispatcher / Queue Consumer"]

        subgraph Pipelines
            VideoPipeline["Video Composition\n(OpenShorts Adapter)"]
            AIPipeline["AI Intelligence\n(Gemini Adapter)"]
            QCPipeline["Quality Control\n(Validation Rules)"]
            PublishPipeline["Social Publisher\n(API Adapters)"]
        end
    end

    Queue[(Redis Queue)] --> Dispatcher
    Dispatcher --> VideoPipeline
    Dispatcher --> AIPipeline
    Dispatcher --> QCPipeline
    Dispatcher --> PublishPipeline
```

### 3.1 Worker Specialization

- **AI Workers**: Lightweight, network-bound. Responsible for communicating with Gemini to extract transcripts, jokes, and metadata.
- **Video Workers**: Heavy, compute-bound. Responsible for communicating with OpenShorts for rendering. May require GPU acceleration.
- **Publishing Workers**: Lightweight, network-bound. Responsible for reliable delivery to social APIs with exponential backoff for rate limits.

## 4. Web Client Architecture (Phase 04)

```mermaid
flowchart TD
    subgraph Web Dashboard
        UI["UI Components (React)"]
        State["Client State Management"]
        APIClient["API Client (Axios/Fetch)"]
        WSClient["WebSocket Client (Real-time)"]
    end

    UI --> State
    State --> APIClient
    State --> WSClient
```

### 4.1 Client Responsibilities

- Provide a responsive layout for mobile and desktop review.
- Render video previews and temporal metadata (captions).
- Manage local state optimistically while synchronizing with the API.
