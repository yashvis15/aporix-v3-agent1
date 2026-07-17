---
name: optimize-document
description: Compress/optimize documents using the Aporix AI API — removes boilerplate and irrelevant content while preserving goal-relevant facts, dates, names, and obligations
metadata: {"openclaw":{"requires":{"bins":["curl"]},"emoji":":scissors:"}}
---

# Optimize Document

Optimizes a document by removing content that is not relevant to the user's stated goal. Uses the Aporix API endpoint.

## Inputs

| Input | Description |
|-------|-------------|
| `document_path` | Path to the document file on disk (.pdf, .txt, .json, .md) |
| `goal` | What the user wants to achieve (e.g. "extract key risks", "summarize obligations") |
| `api_url` | Aporix API URL (default: `https://aporix-v3-agent1.vercel.app/api/optimize`) |

## Workflow

### 1. Validate inputs

- The document must exist at `document_path`
- Supported formats: PDF, TXT, JSON, MD
- The goal must be a non-empty string

### 2. Call the Aporix API

```bash
curl -s -X POST "{api_url}" \
  -F "file=@{document_path}" \
  -F "goal={goal}"
```

### 3. Parse the response

The API returns JSON:

| Field | Description |
|-------|-------------|
| `optimizedText` | The compressed/optimized document text |
| `tokenStats.percentSaved` | Percentage of tokens saved |
| `tokenStats.originalTokens` | Estimated original token count |
| `tokenStats.optimizedTokens` | Estimated optimized token count |
| `tokenStats.tokensSaved` | Raw token savings |
| `costAnalysis.savings` | Estimated cost saved in USD |
| `costAnalysis.model` | Model used for pricing estimate |
| `trustLayer.confidenceScore` | Confidence in preservation (0-1) |
| `removedSummary` | Summary of what was removed |
| `trustLayer.preservedSummary` | Summary of what was kept |
| `meta.fileName` | Original file name |
| `meta.fileType` | File type |

### 4. Present the results

Show the user:
- The optimized text
- Percent saved
- Token counts
- Cost savings
- What was removed vs preserved
- Confidence score

## Error handling

- If `curl` fails, retry once after 2 seconds
- If the API returns a non-200 status, include the error message in the response
- If the document format is unsupported, inform the user of supported types (PDF, TXT, JSON, MD)

## Example

```bash
curl -s -X POST "https://aporix-v3-agent1.vercel.app/api/optimize" \
  -F "file=@/home/ubuntu/contract.pdf" \
  -F "goal=extract termination clauses"
```
