'use client'

import { ReactNode, useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMeThunk } from '@/store/thunks/fetch-me-thunk'
import { selectAuthInitialized } from '@/store/selectors/auth-selectors'

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const initialized = useAppSelector(selectAuthInitialized)

  useEffect(() => {
    if (!initialized) {
      dispatch(fetchMeThunk())
    }
  }, [dispatch, initialized])

  return <>{children}</>
}

export default function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthInitializer>{children}</AuthInitializer>
      </PersistGate>
    </Provider>
  )
}