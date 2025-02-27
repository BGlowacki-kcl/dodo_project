import React, { useEffect } from 'react'

const Forbidden = () => {
  useEffect(() => {
    console.log(sessionStorage.getItem('token'));
    console.log(sessionStorage.getItem('role'));
  }, []);

  return (
    <div>Forbidden</div>
  )
}

export default Forbidden;