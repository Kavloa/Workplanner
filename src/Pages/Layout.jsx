import React from 'react'
import { Outlet } from "react-router-dom";
import {  NavbarWithMegaMenu } from './Components/navbar';
import { useLocation } from 'react-router-dom';

export const Layout = () => {
  const location = useLocation();
  const { username } = location.state || {}; // Get the username from the state

  return (
    <div className='w-full '>
        <NavbarWithMegaMenu />
        <div className='mt-8'>
        <Outlet  />
        {/* <h1>Hello  {username} , Welcome to TSA Time Tracking</h1> */}
        </div>
    </div>
  )
}
