import { createStore } from 'redux';

import initialState from './initial-state';
import reducer from './reducer';

export default function initStore(startState = initialState) {
  return createStore(reducer, startState);
}
