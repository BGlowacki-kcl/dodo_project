import React from 'react';

const FormItem = ({ htmlFor, name, value, onChange, largeArena = false }) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor={htmlFor} 
        className="block text-lg font-medium text-gray-700 mb-1"
      >
        {name}
      </label>
      
      {largeArena ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={5}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          required
        />
      ) : (
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      )}
    </div>
  );
};

export default FormItem;
