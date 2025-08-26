import React from 'react';
import PosterCard from './PosterCard';

const AllPosters = ({ posters }) => {
  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {posters.map((poster, index) => (
        <PosterCard
          key={index}
          image={poster.image}
          title={poster.title}
          price={poster.price}
          tag={poster.tag || 'posterscoop'}
        />
      ))}
    </div>
  );
};

export default AllPosters;
