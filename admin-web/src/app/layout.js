import './globals.css';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, Users, Tags } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';

export const metadata = {
  title: 'JobLink Admin | Premium Dashboard',
  description: 'Manage JobLink users, job postings, and platform settings.',
};

function Sidebar() {
  return (
    <aside className="sidebar glass-card">
      <div className="sidebar-header">
        <h2 style={{ color: 'var(--accent-color)', fontSize: 28, letterSpacing: '-1px' }}>
          BKJ<span style={{ color: 'white' }}> ADMIN</span>
        </h2>
      </div>

      <nav className="sidebar-nav">
        <Link href="/" className="nav-link">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/jobs" className="nav-link">
          <Briefcase size={20} />
          <span>Jobs Management</span>
        </Link>
        <Link href="/users" className="nav-link">
          <Users size={20} />
          <span>Users Management</span>
        </Link>

        <div className="logout-container">
          <LogoutButton />
        </div>
      </nav>

      <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-radius: 12px;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .nav-link:active {
          transform: scale(0.98);
        }
      `}</style>
    </aside>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
