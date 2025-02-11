import React, { useState } from 'react';
import logo from './Componants/logo.png'; // Correctly import the image
import axiosClient from '@axios'; // Import axios
import { Input, Button } from "@material-tailwind/react";

import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigate function

  const onSubmit = async (ev) => {
    ev.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      console.log(username, password);
      // Replace this URL with your actual login API endpoint
      const response = await axiosClient.post('login', {
        username,
        password
      });

      if (response.status === 200) {
        const data = response.data;
        console.log('Login successful:', data);
        // Redirect to the home page after a successful login
        navigate('/');
      } else {
        throw new Error('Login failed');
      }

    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="Login w-full max-w-xl border rounded-[10px] mx-auto my-[8%] px-6">
      <div className="p-[12%] pt-[10%] pl-[10%] pb-[10%] login-container">
        <div className="logo">
          <img src={logo} className="w-[60%] ml-[22%] h-[52%]" alt="Logo" />
        </div>
        <form onSubmit={onSubmit} className="login-form flex flex-col gap-4">
          <div className='mt-[2%]'>
            <h1 className='text-4xl mb-4'>Login</h1>
            <p className='text-2xl mb-3'>Welcome to TSA - Time Sheet</p>
          </div>
          <div className="flex flex-col gap-[35px]">
            <Input 
              variant="outlined" 
              label="User Name"
              name="username" // Add name attribute for form data
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="min-w-[950%] pd h-[150%] text-xl" 
            />
            <Input 
              variant="outlined"
              label="Password"
              type="password"
              name="password" // Add name attribute for form data
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-w-[950%] pd h-[150%] text-xl" 
            />
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button type="submit" variant="outlined" className="text-xl w-[25%] p-2 ml-[89%] text-[#00a2e8] border-[#00a2e8] border-[1px] rounded-[4px] mt-4">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

