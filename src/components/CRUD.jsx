import React, { useEffect, useState } from 'react';
import "./CRUD.css";
import Save from "../assets/Save.svg";

const CRUD = () => {


  return (
    <div className='cardcrud'>
        <div className='search'>
            <img src={Save}></img>
        </div>
    </div>
  )
}

export default CRUD