"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserInfo {
  fullName: string;
  role: string;
  firstname?: string;
  lastname?: string;
  email?: string;
}

interface AuthContextType {
  token: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  user: UserInfo | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Menyimpan token ke localStorage saat berubah
  const handleSetToken = (newToken: string | null) => {
    console.log("Setting new token:", newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
      // Hapus juga userInfo saat logout
      localStorage.removeItem("userInfo");
      setUserInfo(null);
    }
    setToken(newToken);
  };

  // Menyimpan userInfo ke localStorage
  const handleSetUserInfo = (newUserInfo: UserInfo | null) => {
    console.log("Setting new userInfo:", newUserInfo);
    if (newUserInfo) {
      localStorage.setItem("userInfo", JSON.stringify(newUserInfo));
    } else {
      localStorage.removeItem("userInfo");
    }
    setUserInfo(newUserInfo);
  };

  // Fungsi logout
  const handleLogout = async () => {
    handleSetToken(null);
    handleSetUserInfo(null);
  };

  // Mengambil token dan userInfo dari localStorage saat komponen dimuat
  useEffect(() => {
    setIsLoading(true); // Set loading true
    const storedToken = localStorage.getItem("token");
    const storedUserInfo = localStorage.getItem("userInfo");

    console.log("Stored token:", storedToken);
    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (error) {
        console.error("Error parsing userInfo:", error);
      }
    }
    setIsLoading(false); // Set loading false setelah selesai
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        userInfo,
        isLoading,
        setToken: handleSetToken,
        setUserInfo: handleSetUserInfo,
        user: userInfo,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
