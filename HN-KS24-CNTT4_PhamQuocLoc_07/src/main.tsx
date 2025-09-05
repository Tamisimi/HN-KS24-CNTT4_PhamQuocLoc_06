import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UserInterface from './components/UserInterface.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserInterface></UserInterface>
  </StrictMode>,
)
