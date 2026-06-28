import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CmsProvider } from './cms/CmsContext'
import { ToastProvider } from './admin/AdminUI'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CmsProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </CmsProvider>
  </StrictMode>,
)