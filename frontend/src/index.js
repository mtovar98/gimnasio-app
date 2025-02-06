import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from './App';
import Clientes from "./pages/Clientes";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path='/' element={<App></App>}></Route>
      <Route path='/clientes' element={<Clientes/>}></Route>
    </Routes>
  </Router>
);

