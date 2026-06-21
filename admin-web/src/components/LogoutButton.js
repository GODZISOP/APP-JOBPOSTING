'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="nav-link" style={{ 
      background: 'transparent', 
      border: 'none', 
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
      marginTop: 'auto',
      paddingTop: 14
    }}>
      <LogOut size={20} color="var(--warning)" />
      <span style={{ color: 'var(--warning)' }}>Logout</span>
    </button>
  );
}
