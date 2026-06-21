'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, Users, Menu, X } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <h2 style={{ color: 'var(--accent-color)', fontSize: 24, letterSpacing: '-1px', margin: 0 }}>
          BKJ<span style={{ color: 'white' }}> ADMIN</span>
        </h2>
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'transparent', border: 'none', color: 'white', padding: 8 }}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Overlay to close sidebar by tapping outside */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar glass-card ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header desktop-only">
          <h2 style={{ color: 'var(--accent-color)', fontSize: 28, letterSpacing: '-1px' }}>
            BKJ<span style={{ color: 'white' }}> ADMIN</span>
          </h2>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className="nav-link" onClick={() => setIsOpen(false)}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/jobs" className="nav-link" onClick={() => setIsOpen(false)}>
            <Briefcase size={20} />
            <span>Jobs Management</span>
          </Link>
          <Link href="/users" className="nav-link" onClick={() => setIsOpen(false)}>
            <Users size={20} />
            <span>Users Management</span>
          </Link>

          <div className="logout-container">
            <LogoutButton />
          </div>
        </nav>
      </aside>
    </>
  );
}
