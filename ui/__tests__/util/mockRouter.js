import createMemoryHistory from 'react-router/lib/createMemoryHistory';
import createTransitionManager from 'react-router/lib/createTransitionManager';
import { createRouterObject } from 'react-router/lib/RouterUtils';

export default function mockRouter(location = { pathname: '', query: {} }, routes = []) {
  const history = createMemoryHistory(location);
  return createRouterObject(
    history, createTransitionManager(history, routes),
    { location, routes });
}
