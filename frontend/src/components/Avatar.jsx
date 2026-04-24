import React from 'react';
import './Avatar.css';

const Avatar = ({ name, size = '40px', fontSize = '1rem' }) => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
  
  return (
    <div 
      className="default-avatar" 
      style={{ 
        width: size, 
        height: size, 
        lineHeight: size,
        fontSize: fontSize
      }}
    >
      {firstLetter}
    </div>
  );
};

export default Avatar;
