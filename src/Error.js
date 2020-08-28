import React from 'react';
import './App.scss';

const Error = ({children}) => 
      <div className="errorMessage">
        <p>{children}</p>
      </div>
  
export default Error;