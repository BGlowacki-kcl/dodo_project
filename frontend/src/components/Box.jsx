import React from "react";

const Box = ({ image, text, onClick,counter }) => {
  return (
    <button
      onClick={onClick}
      className="relative w-48 h-48 bg-cover bg-center rounded-lg shadow-lg text-white font-semibold overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:brightness-110"
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center flex-col">
        <p className="text-center">{counter}</p>
        <p className="text-center">{text}</p>
      </div>
    </button>
  );
};

export default Box;
