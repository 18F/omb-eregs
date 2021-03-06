// File to be renamed once we can replace routes.jsx
const Routes = require('next-routes');

const routes = Routes()
  .add('homepage', '/', '/')
  .add('search-redirect', '/search-redirect/:lookup(agencies|policies|topics)', 'search-redirect')
  .add('policies')
  .add('document', '/document/:policyId', 'document')
  .add('privacy')
  .add('requirements');

module.exports = routes;
