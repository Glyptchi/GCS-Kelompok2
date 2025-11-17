import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MapPage from './Pages/Map'
import Simulator from './Pages/SImulator'

const App = () => {
  return (
    <Routes>
        <Route path='/' element={<MapPage />} />
        <Route path='/SImulator' element={<Simulator />}/>
    </Routes>
  )
}

export default App