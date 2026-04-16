import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [profilePicture, setProfilePicture] = useState(() => {
    if (user && user.profilePicture) return user.profilePicture;
    return '';
  });

  const updateUser = (userData) => {
    setUser(userData);
    setProfilePicture(userData.profilePicture || '');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateProfilePicture = (newPic) => {
    setProfilePicture(newPic);
    if (user) {
      const updatedUser = { ...user, profilePicture: newPic };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    setProfilePicture('');
    localStorage.clear();
  };

  return (
    <UserContext.Provider value={{ user, profilePicture, updateUser, updateProfilePicture, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
