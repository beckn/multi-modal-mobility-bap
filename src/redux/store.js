import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import rootReducer from './rootReducer'

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'

const reducers = combineReducers(rootReducer)

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user'],
}

const persistedReducer = persistReducer(persistConfig, reducers)

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => {
    const middleware = getDefaultMiddleware({
      // serializableCheck: {
      //   ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      // },
      serializableCheck: false
    })
    // }).concat(api.middleware)

    // if (__DEV__ && !process.env.JEST_WORKER_ID) {
    //   const createDebugger = require('redux-flipper').default
    //   middleware.push(createDebugger())
    // }

    return middleware
  },
})

const persistor = persistStore(store)

setupListeners(store.dispatch)

export { store, persistor }
