/* eslint no-console: 'off' */

import cfenv from 'cfenv';
import express from 'express';

const app = express();
const env = cfenv.getAppEnv();

app.get('/', (req, res) => res.send('OK'));
app.listen(env.port, () => {
  console.log(`Listening on ${env.port}`);
});
