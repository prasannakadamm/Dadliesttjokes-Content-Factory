# Phase 05 Correction Report

## Summary of Fixes

### 1. Webhook Signature Format Hardening
- **Issue**: The original implementation expected the raw HMAC hex string (`<hex>`) but the OpenShorts provider sends the signature in the format `sha256=<hex>`.
- **Fix**: Updated `VideoProcessingService.handleWebhook` to prepend `sha256=` to the computed HMAC before performing `crypto.timingSafeEqual`.
- **Testing**: Added regression tests ensuring that `sha256=<hex>` passes and that tampered or missing prefix fails.

### 2. Fastify Raw Body Verification
- **Issue**: Fastify's default JSON parser consumed the raw payload, meaning that stringifying the payload back to JSON might not match the original byte sequence (e.g. if the provider added extra spaces or newlines), causing signature verification failures.
- **Fix**: Installed and configured the maintained `fastify-raw-body` plugin to expose the original unmodified byte string as `request.rawBody`. This guarantees the exact byte sequence is hashed for HMAC verification.

### 3. OpenShorts Status Parsing Fix
- **Issue**: The webhook payload payload schema was incorrectly documented in the previous implementation. The `clips` array was nested within a `result` object, not at the root. Furthermore, unknown statuses were defaulting to `queued`.
- **Fix**: 
  - Typed the OpenShorts status response with strict interfaces.
  - Parsed clips from `data.result.clips` instead of `data.clips`.
  - Added strict validation of provider statuses. Any unknown status now correctly throws a `VideoProcessorError` rather than silently defaulting to `queued`.
  - Used deterministic provider clip ID generation following the pattern: `clip_<providerJobId>_<index>`.

### 4. Provider Error Sanitization
- **Issue**: Raw provider error payloads were potentially being leaked back to the client or console logs, risking exposure of internal OpenShorts error formatting or IDs.
- **Fix**: Standardized error handling across all provider calls (`submitJob`, `getJobStatus`). We no longer log the `errorText` or `response.text()` from failed fetch calls. We simply log the status and throw a generic sanitized `VideoProcessorError`.

## Current Status
- **Tests**: All tests pass. Added tests for raw body signature formatting.
- **Verification**: `pnpm run format:check`, `typecheck`, and `lint` are completely clean.
- **Readiness**: Phase 05 is ready for the independent audit.

*Note: Phase 05 remains LOCKED at 'READY FOR INDEPENDENT VERIFICATION' and is NOT YET VERIFIED.*
