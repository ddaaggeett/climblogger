import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import thunk from 'redux-thunk';
import logger from '../dev/logger';
import rootReducer from '../reducers';

const isProduction = process.env.NODE_ENV === 'production';

const persistConfig = {
    key: 'root',
    storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Creating store
export default () => {
  let store = null;
  let middleware = null;

  if (isProduction) {
    // In production adding only thunk middleware
    middleware = applyMiddleware(thunk);
  } else {
    // In development mode beside thunk
    // logger and DevTools are added
    middleware = applyMiddleware(thunk);
    middleware = applyMiddleware(thunk, logger);

    // Enable DevTools if browser extension is installed
    if (!process.env.SERVER_RENDER && window.__REDUX_DEVTOOLS_EXTENSION__) { // eslint-disable-line
      middleware = compose(
        middleware,
        window.__REDUX_DEVTOOLS_EXTENSION__() // eslint-disable-line
      );
    }
  }

  store = createStore(
      persistedReducer,
      middleware
  );

  let persistor = persistStore(store)
  // persistor.purge() // TODO: run as separate script when necessary

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers/index').default; // eslint-disable-line global-require
      store.replaceReducer(persistConfig, nextRootReducer);
    });
  }

  return { store, persistor }
};
