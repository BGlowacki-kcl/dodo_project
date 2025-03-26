import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

    if (!validateEmail(formData.email)) {
      setStatus('error');
      showNotification('Please provide a valid email address', 'danger');
      return;
    }

    try {
      setStatus('sending');
      const response = await sendEmail(formData);
      console.log('Email response:', response);
      const successMessage = response?.message || 'Message sent successfully!';
      showNotification(successMessage, 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setStatus('success');
    } catch (error) {
      const errorMessage = error.message || 'Failed to send message';
      showNotification(errorMessage, 'error');
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 min-h-screen p-10 pt-24">
      {/* Header section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800">Get in <span className="text-blue-500">Touch</span></h1>
        <p className="text-gray-600 mt-2 text-lg">We'd love to hear from you and help with any questions</p>
      </div>

      {/* Contact form */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormItem 
              htmlFor="name" 
              name="name" 
              label="Your Name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <FormItem 
              htmlFor="email" 
              name="email" 
              label="Email Address" 
              value={formData.email} 
              onChange={handleChange} 
              required
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <FormItem 
          htmlFor="subject" 
          name="subject" 
          label="Subject" 
          value={formData.subject} 
          onChange={handleChange} 
          required
          placeholder="What is this regarding?"
        />
        
        <FormItem 
          htmlFor="message" 
          name="message" 
          label="Your Message" 
          value={formData.message} 
          onChange={handleChange} 
          largeArena={true}
          required
          placeholder="Please describe how we can help you..."
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={status === 'sending'}
            className={`w-full py-4 text-lg font-medium text-white rounded-lg shadow-md transition-all duration-300
              ${status === 'sending' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>

      {/* Help text */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Looking for job opportunities? <Link to="/search-results" className="text-blue-600 hover:underline">Browse all jobs</Link>
        </p>
      </div>

      {/* Footer Section */}
      <div className="w-full mt-20 border-t border-gray-300 py-6 text-center">
        <p className="text-gray-600">Joborithm &copy; {new Date().getFullYear()} - Your gateway to the best career opportunities.</p>
        <div className="flex justify-center gap-4 mt-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-800 transition">Home</Link>
          <span className="text-gray-400">|</span>
          <Link to="/search-results" className="hover:text-gray-800 transition">Jobs</Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;