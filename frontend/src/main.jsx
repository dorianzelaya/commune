import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { applyTextSize, getTextSize } from './utils/textsize'

// Apply the saved reading text size before the first render, so a user
// who picked "Larger" sees it immediately on load rather than only after
// visiting the Bible reader.
applyTextSize(getTextSize())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service worker registered:', reg))
      .catch(err => console.log('Service worker registration failed:', err))
  })
}
if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('portrait').catch(() => {})
}
