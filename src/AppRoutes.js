import { Route,Routes } from 'react-router-dom';
import React,{useContext} from 'react'
import Map from './Map';
import History from './History';
import './routes.scss'  

function AppRoutes() {

  return (
    <div className='routes'>
            <Routes>
                <Route path="/" element={ <Map/>} />
                <Route path="/History" element={ <History/>} />
            </Routes>          
    </div>
  )
}

export default AppRoutes
