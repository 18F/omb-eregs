const config = {
  apiRoot: 'https://example.com/',
};

if (typeof process !== 'undefined') {
  Object.assign(config, {
    apiRoot: process.env.INTERNAL_API,
  });
}

if (typeof window !== 'undefined' && window.APP_CONFIG) {
  Object.assign(config, window.APP_CONFIG);
}

export default config;
