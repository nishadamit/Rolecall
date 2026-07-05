import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, []);

  return <AuthContext.Provider value={{ user, setUser, checked }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
