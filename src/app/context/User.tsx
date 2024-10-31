"use client";

import { createContext, ReactNode, useContext, useState } from "react";

import { Response_md5 } from "../interface/Md5";
import { User } from "../interface/User";

interface UserContextType {
  user: User | null;
  idUser: (data: Response_md5) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser utilizado envolto em um UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const idUser = (data: Response_md5) => {
    const { NmUsuario, NmEmpresa } = data.Value;
    setUser({ name: NmUsuario, empresa: NmEmpresa });
  };

  return (
    <UserContext.Provider value={{ user, idUser }}>
      {children}
    </UserContext.Provider>
  );
};
