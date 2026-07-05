import Sidebar from './Sidebar';

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">{children}</div>
    </div>
  );
}

export default AppShell;
