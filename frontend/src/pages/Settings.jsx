import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { ROLE_META, useRole } from '../context/RoleContext';

function Settings() {
  const { role } = useRole();

  return (
    <AppShell>
      <PageHeader eyebrow={ROLE_META[role].eyebrow} title="Settings" />

      <div className="settings-grid">
        <div className="settings-card">
          <h3>Profile</h3>
          <div className="card-sub">Your identity within Rolecall. (Preview only — no logged-in user yet.)</div>
          <div className="settings-field">
            <label>Full Name</label>
            <input type="text" defaultValue="Amit Kumar" />
          </div>
          <div className="settings-field">
            <label>Email</label>
            <input type="email" defaultValue="amit.k@rolecall.dev" disabled />
          </div>
          <div className="settings-field">
            <label>Organization</label>
            <input type="text" defaultValue="Acme Org" disabled />
          </div>
          <button className="btn-save">Save Changes</button>
        </div>
        <div className="settings-card">
          <h3>Password</h3>
          <div className="card-sub">Changing this signs you out of all other sessions.</div>
          <div className="settings-field">
            <label>Current Password</label>
            <input type="password" placeholder="••••••••••" />
          </div>
          <div className="settings-field">
            <label>New Password</label>
            <input type="password" placeholder="••••••••••" />
          </div>
          <div className="settings-field">
            <label>Confirm New Password</label>
            <input type="password" placeholder="••••••••••" />
          </div>
          <button className="btn-save">Update Password</button>
        </div>
      </div>
    </AppShell>
  );
}

export default Settings;
