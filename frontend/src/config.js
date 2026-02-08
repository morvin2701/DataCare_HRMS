const config = {
    // Use Vercel proxy on production (HTTPS), direct backend on localhost
    API_URL: import.meta.env.VITE_API_URL || (
        typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? 'http://82.29.165.232'
            : '/api/proxy'
    ),
};

export default config;
