import "./globals.css";

import type { Metadata } from "next";

import Footer from "./components/Footer";
import Header from "./components/Header";
import { SocketProvider } from "./context/Socket";
import { UserProvider } from "./context/User";

export const metadata: Metadata = {
  title: "Talkie",
  description: "Projeto de Inovação - 3Tecnos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-hidden">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        />
      </head>
      <body
        className={"flex min-h-screen flex-col overflow-hidden antialiased"}
      >
        <UserProvider>
          <SocketProvider>
            <Header />

            <main className="my-auto flex items-center justify-center">
              {children}
            </main>
            
          </SocketProvider>
        </UserProvider>
      </body>
    </html>
  );
}
