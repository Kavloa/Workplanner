import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// import express from 'express';
// import cors from 'cors';
import {NextUIProvider} from '@nextui-org/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NextUIProvider>  
      <App />
    </NextUIProvider>
  </React.StrictMode>,
)

// const express = require('express');
// const cors = require('cors');

// const app = express();

// // Enable CORS for all routes
// app.use(cors({origin:"http://localhost:8000"}))
