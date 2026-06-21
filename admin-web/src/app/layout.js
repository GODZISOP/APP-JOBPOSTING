import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'JobLink Admin | Premium Dashboard',
  description: 'Manage JobLink users, job postings, and platform settings.',
};

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
