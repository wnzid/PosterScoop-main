import React from 'react';

const PosterCard = ({ image, title, price, tag }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden flex flex-col">
      {/* Image with aspect ratio */}
      <div className="relative w-full aspect-[3/4] bg-gray-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Tag label */}
        <span className="absolute bottom-2 left-2 bg-black text-white text-xs px-2 py-1 rounded shadow">
          {tag}
        </span>
      </div>

      {/* Text section */}
      <div className="p-4 text-center">
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">From BDT {price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default PosterCard;
