// Vercel serverless function to proxy requests to HTTP backend
// This solves the HTTPS -> HTTP mixed content blocking issue

// Disable Vercel's body parser to handle raw FormData
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    const BACKEND_URL = 'http://82.29.165.232';

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Parse URL to get path from query param (added by vercel.json rewrite)
        // Note: req.url in Vercel functions might be relative or full depending on environment/rewrites
        // We handle both cases safely
        const url = new URL(req.url, 'http://localhost');
        const proxyPath = url.searchParams.get('__proxy_path');

        // Remove internal query param so we don't send it to backend
        url.searchParams.delete('__proxy_path');

        // Determine path: fallback to URL replacement if query param missing
        // If proxyPath is present, use it. Otherwise try to extract from pathname.
        let path = proxyPath;
        if (!path) {
            // Fallback for direct calls or different rewrite behavior
            path = url.pathname.replace('/api/proxy', '');
        }

        // Ensure path starts with /
        if (path && !path.startsWith('/')) {
            path = '/' + path;
        }

        // Construct target URL
        // BACKEND_URL + path + query_string
        const targetUrl = `${BACKEND_URL}${path || ''}${url.search}`;

        // Build headers
        const headers = {};
        if (req.headers['content-type']) {
            headers['Content-Type'] = req.headers['content-type'];
        }
        // Forward authorization if present
        if (req.headers['authorization']) {
            headers['Authorization'] = req.headers['authorization'];
        }

        // Build fetch options
        const fetchOptions = {
            method: req.method,
            headers: headers,
        };

        // Forward body for non-GET requests by reading raw request stream
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks = [];
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            fetchOptions.body = Buffer.concat(chunks);
        }

        // Make request to backend
        const response = await fetch(targetUrl, fetchOptions);

        // Forward status and headers
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // Use arrayBuffer() for compatibility with native fetch in Node 18+
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return res.status(response.status).send(buffer);
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: 'Proxy request failed', details: error.message });
    }
}
