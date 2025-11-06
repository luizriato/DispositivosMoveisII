import React, { createContext, useState, useContext } from 'react';

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const [databaseType, setDatabaseType] = useState(null); // 'sqlite' ou 'mongodb'

  const selectDatabase = (type) => {
    setDatabaseType(type);
  };

  return (
    <DatabaseContext.Provider value={{ databaseType, selectDatabase }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

