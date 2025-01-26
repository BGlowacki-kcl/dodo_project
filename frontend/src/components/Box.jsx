import React from "react";

const Box = ({ image, text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative w-48 h-48 bg-cover bg-center rounded-lg shadow-lg text-white font-semibold overflow-hidden focus:outline-none focus:ring-2 focus:ring-slate-500 transform transition-transform duration-300 hover:scale-105 hover:brightness-110"
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <span className="text-center">{text}</span>
      </div>
    </button>
  );
};

export default Box;
