import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="bg-white text-slate-900 min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      <Header />
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
