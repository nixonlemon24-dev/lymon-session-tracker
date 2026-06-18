import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar'
import Home from './pages/Home'; 
import "./css/App.css";
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import ForgotPassword  from './pages/ForgotPassword';
import Members from './pages/Members';
import Packages  from './pages/Packages';
import Sessions  from './pages/Sessions';
import Pricing  from './pages/Pricing';
// import './signup.css'


function App() {
  return (
//  <AuthProvider>
  <div className="App">
      {/* <Navbar /> */}
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/dashboard' element={<Home />}/>
        <Route path='/create-account' element={<CreateAccount />}/>
        <Route path='/forgot-password' element={<ForgotPassword />}/>
        <Route path='/Members' element={<Members />}/>
        <Route path='/Packages' element={<Packages />}/>
        <Route path='/Sessions' element={<Sessions />}/>
        <Route path='/Pricing' element={<Pricing />}/>
      </Routes>
    </div>
  // </AuthProvider>
  )
}

export default App
