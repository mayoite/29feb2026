# AI Recommendation Spec (`/api/ai-advisor`)

## Objective
Provide deterministic, safe, and resilient product recommendations for workspace queries while preserving privacy and stable client contracts.

## Endpoint Contract
- Method: `POST`
- Path: `/api/ai-advisor`
- Auth mode:
  - Preferred: authenticated user/session (server-derived identity)
  - Anonymous fallback: server-issued signed visitor id (httpOnly cookie)

### Request Schema
```json
{
  "query": "string (min 8, max 600)",
  "context": {
    "city": "optional string",
    "teamSize": "optional number",
    "budget": "optional string"
  }
}
```

### Success Response Schema
```json
{
  "ok": true,
  "data": {
    "recommendations": [
      {
        "productId": "string",
        "productName": "string",
        "category": "string",
        "why": "string",
        "budgetEstimate": "string"
      }
    ],
    "totalBudget": "string",
    "summary": "string"
  },
  "meta": {
    "requestId": "string",
    "model": "string",
    "durationMs": 123
  }
}
```

### Error Response Schema
```json
{
  "ok": false,
  "error": {
    "code": "INVALID_INPUT | AI_UNAVAILABLE | AI_TIMEOUT | PARSE_FAILED | INTERNAL_ERROR",
    "message": "human readable",
    "requestId": "string"
  }
}
```

## Deterministic Parser Strategy
1. Validate incoming request with Zod.
2. Call provider with low-variance settings (`temperature <= 0.2`).
3. Parse response as JSON only.
4. Validate parsed payload with Zod response schema.
5. If parsing/validation fails:
  - attempt one constrained repair pass,
  - otherwise return deterministic fallback recommendation set.

## Timeout and Fallback Behavior
- Upstream timeout: `8s` hard timeout via `AbortController`.
- On timeout/provider error:
  - return `ok: false` with `AI_TIMEOUT`/`AI_UNAVAILABLE`, OR
  - optionally return `ok: true` with fallback curated recommendations (flagged in `meta`).
- Cache strategy:
  - short TTL cache (`60-180s`) by normalized query hash to reduce repeated provider calls.

## Safe Prompting Contract
- System prompt includes only required catalog fields.
- No raw user PII in logs.
- No direct ingestion of untrusted HTML/markdown from user input.
- Explicit allowlist for output keys.

## Implementation Notes (Code Blueprint)
```ts
// app/api/ai-advisor/route.ts
const ReqSchema = z.object({
  query: z.string().min(8).max(600),
  context: z.object({ city: z.string().optional(), teamSize: z.number().int().positive().optional(), budget: z.string().optional() }).optional(),
});

const RecSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  category: z.string(),
  why: z.string().min(8),
  budgetEstimate: z.string(),
});

const RespSchema = z.object({
  recommendations: z.array(RecSchema).min(1).max(5),
  totalBudget: z.string(),
  summary: z.string().min(10),
});
```

## Validation Checklist
1. Invalid payload -> `400` + `INVALID_INPUT`.
2. Provider timeout -> `504/AI_TIMEOUT` or fallback success path.
3. Malformed model output -> no unhandled 500.
4. Response always matches success/error envelope.
5. No raw prompt/user id in logs.