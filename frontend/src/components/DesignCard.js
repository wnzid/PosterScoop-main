import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { priceList } from '../utils/priceList';
import '../App.css';
import getImageUrl from '../utils/getImageUrl';

const getLowestPrice = () => {
  let min = Infinity;
  Object.values(priceList).forEach((entry) => {
    if (Array.isArray(entry)) {
      entry.forEach(({ price }) => {
        if (price < min) min = price;
      });
    } else {
      Object.values(entry).forEach((arr) => {
        arr.forEach(({ price }) => {
          if (price < min) min = price;
        });
      });
    }
  });
  return min;
};

const lowestPrice = getLowestPrice();

function DesignCard({ design }) {
  const [imgUrl, setImgUrl] = useState('');

  useEffect(() => {
    let isMounted = true;
    getImageUrl(design.imageKey)
      .then((url) => {
        if (isMounted) setImgUrl(url);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [design.imageKey]);

  return (
    <Link to={`/designs/${design.id}`} className="design-card">
      {imgUrl && (
        <img
          src={imgUrl}
          alt={design.title}
          loading="lazy"
        />
      )}
      <div className="design-card-info">
        <p>{design.title}</p>
        <span>Starting from BDT {lowestPrice}</span>
      </div>
    </Link>
  );
}

export default DesignCard;
