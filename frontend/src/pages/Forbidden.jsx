// Forbidden page, displayd after a user tries accessing valid url, but allowed only for different users

import React from 'react'
import { useNavigate } from 'react-router-dom';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    
  <div className='items-center justify-center bg-white flex h-screen w-full flex-col'>
    <div className='flex flex-row'>
      <button 
        className='border-2 rounded-lg h-10 w-32 hover:bg-gray-800 hover:text-white bg-gray-400 mr-10' 
        onClick={() => navigate(-1)}
      >
        Go back!
      </button>
      <h1 className='mb-20 text-4xl font-bold' >
        <b>
          Ooops...!
        </b> 
        <br /><br /> 
        This page is forbidden, how did you get here?
      </h1>
    </div>
    <img src="/warning.svg" alt="Url forbidden" className='w-1/4 h-auto' />
  </div>
  )
}

export default Forbidden;