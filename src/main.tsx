import React from 'react'
import ReactDOM from 'react-dom/client'
import {NextUIProvider} from '@nextui-org/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import ThemedToaster from './components/ThemedToaster.tsx'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <NextUIProvider>
          <AuthProvider>
            <ThemedToaster />
            <App />
          </AuthProvider>
        </NextUIProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
