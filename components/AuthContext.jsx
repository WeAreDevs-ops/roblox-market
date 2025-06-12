import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [seller, setSeller] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedSeller = JSON.parse(localStorage.getItem("seller"));
    if (storedSeller) setSeller(storedSeller);
  }, []);

  const login = (sellerData) => {
    setSeller(sellerData);
    localStorage.setItem("seller", JSON.stringify(sellerData));
  };

  const logout = () => {
    setSeller(null);
    localStorage.removeItem("seller");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ seller, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
