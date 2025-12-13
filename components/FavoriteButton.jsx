import React, { useState } from 'react';

/**
 * FavoriteButton Component
 * A heart icon button that toggles favorite/liked state
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onToggle - Callback function when favorite state changes
 * @param {Boolean} props.isFavorited - Initial favorited state
 * @param {String} props.className - Additional CSS classes
 * @returns {JSX.Element} Heart icon button component
 */
const FavoriteButton = ({ 
  onToggle = () => {}, 
  isFavorited = false, 
  className = '' 
}) => {
  const [liked, setLiked] = useState(isFavorited);

  const handleClick = () => {
    const newState = !liked;
    setLiked(newState);
    onToggle(newState);
  };

  return (
    <button
      onClick={handleClick}
      className={`favorite-button ${liked ? 'liked' : ''} ${className}`}
      aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
      type="button"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="heart-icon"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
};

export default FavoriteButton;
