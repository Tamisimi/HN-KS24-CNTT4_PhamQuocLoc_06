import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.scss'
import BillManager from './components/UserInterface'

function App() {
  const [count, setCount] = useState(0)

  return (

    <div>
      <BillManager></BillManager>
    </div>
  )
}

export default App