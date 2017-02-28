import { Resolver } from 'react-resolver';

import routes from './routes';
import { setApiUrl } from './globals';

setApiUrl(window.API_URL);
Resolver.render(() => routes, document.getElementById('app'));
