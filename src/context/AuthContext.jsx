import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);

      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    } else {
    // 👇 TEMP DEV LOGIN
    if (process.env.NODE_ENV === "development") {
      const fakeUser = { id: 1, name: "Dev User", role: "admin" };
      const fakeToken = "dev-token";

      localStorage.setItem("token", fakeToken);
      localStorage.setItem("user", JSON.stringify(fakeUser));

      setToken(fakeToken);
      setUser(fakeUser);
    }
  }

    setLoading(false);
  }, []);

  const login = (tokenVal, userData) => {
    localStorage.setItem("token", tokenVal);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(tokenVal);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    
  };

   const updateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}