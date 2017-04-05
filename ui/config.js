const config = {
  apiRoot: 'https://example.com/',
  debug: false,
};

if (typeof process !== 'undefined') {
  Object.assign(config, {
    apiRoot: process.env.INTERNAL_API,
    debug: process.env.NODE_ENV !== 'production',
  });
}

if (typeof window !== 'undefined' && window.APP_CONFIG) {
  Object.assign(config, window.APP_CONFIG);
}

export default config;
