import React, { useState } from 'react'
import sendEmail from '../services/email.service.js';
import FormItem from '../components/FormItem.jsx';
import { useNotification } from '../context/notification.context.jsx';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null);
  const showNotification = useNotification();

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!validateEmail(formData.email)){
      setStatus('error');
      showNotification('Please provide a valid email address', 'error');
      return ;
    }

    sendEmail(formData, setStatus, showNotification, setFormData);
  };

  return (
    <div className='h-full w-full flex items-center justify-center bg-slate-900 pb-10'>
      
      <form onSubmit={handleSubmit} className="max-w-lg mt-10 mx-auto bg-white p-6 rounded-3xl w-1/2 shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Contact Us</h2>

        <FormItem htmlFor="name" name="name" value={formData.name} onChange={handleChange} />
        <FormItem htmlFor="email" name="email" value={formData.email} onChange={handleChange} />
        <FormItem htmlFor="subject" name="subject" value={formData.subject} onChange={handleChange} />
        <FormItem htmlFor="message" name="message" value={formData.message} onChange={handleChange} largeArena={true} />

        <button
          type="submit" 
          disabled={status === 'sending'}
          className={`w-full py-3 text-lg font-medium text-white rounded-lg transition-all duration-300 hover:cursor-pointer
            ${status === 'sending' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>

    </div>
  );
};

export default Contact