import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MapPage from './Pages/Map'
import Simulator from './Pages/Simulator'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<MapPage />} />
      <Route path='/simulator' element={<Simulator />} />
    </Routes>
  )
}

export default App