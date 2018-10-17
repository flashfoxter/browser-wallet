import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './components/App';
import reducer from './reducers';

export const store = createStore(reducer);

store.subscribe((inp) => {
    console.log('store cnanged', inp);
})

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
