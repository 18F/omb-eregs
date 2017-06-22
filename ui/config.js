const config = {
  apiRoot: 'https://example.com/',
  debug: false,
  cacheConfig: {
    max: 32,
    maxAge: 1000 * 60 * 60,   // 1 hour
  },
};

if (typeof process !== 'undefined') {
  Object.assign(config, {
    apiRoot: process.env.API_URL,
    clientSide: false,
    debug: process.env.NODE_ENV !== 'production',
  });
}

if (typeof window !== 'undefined' && window.APP_CONFIG) {
  Object.assign(config, window.APP_CONFIG, { clientSide: true });
}

export default config;
