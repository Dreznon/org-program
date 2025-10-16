import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

async function prepare() {
  if (import.meta.env.DEV) {
    try {
      const { setupMsw } = await import('./mocks/browser')
      await setupMsw()
      // eslint-disable-next-line no-console
      console.debug('[web] MSW started')
    } catch {
      // noop if MSW not available
    }
  }
}

prepare().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
})
