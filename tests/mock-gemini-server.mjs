import http from 'node:http';
import { URL } from 'node:url';

/**
 * Lightweight mock of the Gemini API used by Aporix E2E tests.
 *
 * The v3 optimizer expects plain text output (not JSON) from Gemini and
 * computes summaries/metrics server-side, so this mock returns a concise
 * goal-focused text extract.
 *
 * No real API keys or external calls are involved.
 */

const PORT = Number(process.env.MOCK_GEMINI_PORT || 4010);

const OPTIMIZED_TEXT = [
  '- Agreement: Vendor Services Agreement (consulting services).',
  '- Deadlines: Provider must meet all agreed delivery deadlines.',
  '- Key risk / penalty: Late deliveries incur a 5% penalty per month.',
  '- Termination: Either party may terminate with 30 days written notice.',
  '- Confidentiality: Obligations survive termination for two years.',
  '- Payment: Per agreed schedule; non-payment may suspend services.',
].join('\n');

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
}

const server = http.createServer((req, res) => {
  const method = req.method || 'GET';
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (method === 'GET' && url.pathname === '/health') {
    return json(res, 200, { ok: true });
  }

  // Model discovery: /v1beta/models
  if (method === 'GET' && url.pathname.endsWith('/models')) {
    return json(res, 200, {
      models: [
        { name: 'models/gemini-2.0-flash', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-1.5-flash', supportedGenerationMethods: ['generateContent'] },
      ],
    });
  }

  // Generate content: /v1beta/models/<model>:generateContent
  if (method === 'POST' && url.pathname.includes(':generateContent')) {
    return json(res, 200, {
      candidates: [
        {
          content: {
            parts: [{ text: OPTIMIZED_TEXT }],
            role: 'model',
          },
          finishReason: 'STOP',
          index: 0,
        },
      ],
    });
  }

  return json(res, 404, { error: { message: `Not found: ${method} ${url.pathname}` } });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock Gemini server listening on http://127.0.0.1:${PORT}`);
});
