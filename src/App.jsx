import React from 'react'
import {Routes, Route, Link, Router} from 'react-router-dom'
import Map from './Pages/Map';
import Simulator from './Pages/Simulator';
import './App.css';

const App =() => {
    return (
        <Routes>
            <Route path='/' element={<Map/>}></Route>
            <Route path='/simulator' element={<Simulator/>}></Route>
        </Routes>
    )
}

export default App;