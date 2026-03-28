import React from 'react'
import ReactDOM from 'react-dom/client'
import {NextUIProvider} from '@nextui-org/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NextUIProvider>
        <AuthProvider>
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            theme="dark"
            toastOptions={{
              className: "bg-zinc-900/90 border-white/10 backdrop-blur-md text-white shadow-2xl",
            }}
          />
          <App />
        </AuthProvider>
      </NextUIProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
