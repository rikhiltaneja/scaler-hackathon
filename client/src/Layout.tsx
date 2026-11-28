import { Link, Outlet } from 'react-router-dom';

// Shared shell for every page: header + the page's own content via
// <Outlet />. Keeps page components focused on their own content only.
export default function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title-link">
          <h1>Sahayika Voice Intake</h1>
        </Link>
        <p>Speak the home visit notes — the form fills itself.</p>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
