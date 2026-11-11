import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import MapPage from './Pages/Map'
import Simulator from './Pages/SImulator'
import Fly from './Pages/Fly'
import ModeNavigation from './components/ModeNavigation'
import { setMapMode } from './baseMap/leaflet'
import './App.css'

const App = () => {
  const { pathname } = useLocation();
  const mode = pathname.toLowerCase().startsWith('/simulator')
    ? 'simulator' : pathname.toLowerCase().startsWith('/fly') ? 'fly' : 'plan';
  useEffect(() => { setMapMode(mode); }, [mode]);
  return (
    <>
    <ModeNavigation />
    <Routes>
      <Route path='/' element={<MapPage />} />
      <Route path='/fly' element={<Fly />} />
      <Route path='/simulator' element={<Simulator />} />
    </Routes>
    </>
  )
}

export default App
