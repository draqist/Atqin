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
import storage from 'redux-persist/lib/storage'; // Defaults to localStorage for web
import uiReducer from './features/uiSlice';

// 1. Combine all your slices here
const rootReducer = combineReducers({
  ui: uiReducer,
  // auth: authReducer, // Add future slices here
});

// 2. Configure Persistence
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['ui'], // Only persist the 'ui' slice (don't persist things that should reset on refresh)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 3. Create the Store
export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these Redux Persist actions to prevent errors
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
};

export const store = makeStore()
export const persistedStore = persistStore(store)

// 4. Export Types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];