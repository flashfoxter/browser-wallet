import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './components/App';
import { StreamActionsController } from './controllers/stream-actoions-controller';
import { StreamConfigController } from './controllers/stream-config';
import reducer from './reducers';

export const store = createStore(reducer);
export const streamActionsController = new StreamActionsController(store);
export const streamConfig = new StreamConfigController(store);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
