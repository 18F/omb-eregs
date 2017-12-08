import { createStore } from 'redux';

import initialState from './initial-state';
import reducer from './reducer';

const devtoolsField = '__REDUX_DEVTOOLS_EXTENSION__';

export default function initStore(startState = initialState, { isServer = true, debug }) {
  let enhancer;
  if (!isServer && debug && window[devtoolsField]) {
    enhancer = window[devtoolsField]();
  }
  return createStore(reducer, startState, enhancer);
}
