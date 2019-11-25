import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore} from 'redux';
import reduxThunk from 'redux-thunk';
import {BrowserRouter, Router} from 'react-router-dom';

import ScrollToTop from './components/Common/ScrollToTop';
import History from './history';
import Routes from './routes';

import rootReducer from './reducers';
import {getSession} from './actions';
import * as type from "./actions/types";

import * as serviceWorker from './serviceWorker';
import 'react-app-polyfill/ie11';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
// import 'react-app-polyfill/ie11';
import 'core-js/features/array/find';
import 'core-js/features/array/includes';
import 'core-js/features/number/is-nan';
/*
// UNCOMMENT IT FOR PRODUCTION
const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore);
const store = createStoreWithMiddleware(rootReducer);
*/

/* COMMENT IT OUT FOR PRODUCTION */
const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(reduxThunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
  )
);

getSession((me) => {
  me && store.dispatch({type: type.AUTH_USER, payload: me});
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <Router history={History}>
          <ScrollToTop>
            <Routes me={me}/>
          </ScrollToTop>
        </Router>
      </BrowserRouter>
    </Provider>, document.getElementById('root'));
  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: http://bit.ly/CRA-PWA
  serviceWorker.unregister();
});

