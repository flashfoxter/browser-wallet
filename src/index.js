import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './components/App';
import reducer from './reducers';
import {StreamActionsController} from './controllers/stream-actoions-controller';

export const store = createStore(reducer);
export const streamActionsController = new StreamActionsController(store);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
