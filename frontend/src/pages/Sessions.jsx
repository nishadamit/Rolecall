import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { ROLE_META, useRole } from '../context/RoleContext';

const SESSIONS = [
  { device: 'Chrome — Windows', sub: 'This device', location: 'Ghaziabad, IN', lastActive: 'Just now', current: true },
  { device: 'Safari — iPhone', location: 'Delhi, IN', lastActive: '2 hours ago', current: false },
  { device: 'Chrome — macOS', location: 'Bengaluru, IN', lastActive: '3 days ago', current: false },
];

function Sessions() {
  const { role } = useRole();

  return (
    <AppShell>
      <PageHeader
        eyebrow={ROLE_META[role].eyebrow}
        title="Active Sessions"
        action={<button className="btn-ghost">Revoke All Other Sessions</button>}
      />

      <div className="empty-note">
        Sessions map to active refresh tokens. Revoking one signs that device out immediately — this is what
        the auth/jwt-access-refresh branch implements server-side. This page is a static preview only.
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Device</th>
            <th>Location</th>
            <th>Last Active</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {SESSIONS.map((session) => (
            <tr key={session.device}>
              <td className="row-title">
                {session.device}
                {session.sub && <div className="row-sub">{session.sub}</div>}
              </td>
              <td>{session.location}</td>
              <td>{session.lastActive}</td>
              <td>
                <span className={`pill ${session.current ? 'current' : 'todo'}`}>
                  {session.current ? 'Current' : 'Active'}
                </span>
              </td>
              <td className="actions-cell">{session.current ? '—' : <button className="btn-ghost">Revoke</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppShell>
  );
}

export default Sessions;
