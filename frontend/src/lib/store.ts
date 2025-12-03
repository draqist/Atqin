import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import uiReducer from './features/uiSlice';

/**
 * Root reducer combining all application slices.
 */
const rootReducer = combineReducers({
  ui: uiReducer,
});

/**
 * Configuration for Redux Persist.
 * Whitelists the 'ui' slice to be persisted in storage.
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['ui'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Creates and configures the Redux store.
 * Sets up persistence and middleware.
 */
export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
};

export const store = makeStore();
export const persistedStore = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];