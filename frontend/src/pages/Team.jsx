import { useEffect, useState } from 'react';
import { Spin, message, Popconfirm } from 'antd';
import { getAllUsers, createUser, updateUser, deleteUser } from '../api/users';
import { getAllOrganizations } from '../api/organizations';
import Stamp from '../components/Stamp';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { ROLE_META, useRole } from '../context/RoleContext';

function InviteUserModal({ organizations, allowedRoles, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? '');
  const [userRole, setUserRole] = useState(allowedRoles[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !orgId) return;
    setSubmitting(true);
    createUser({ org_id: orgId, name, email, role: userRole })
      .then(() => {
        onCreated();
        onClose();
      })
      .catch(() => message.error('Failed to invite user'))
      .finally(() => setSubmitting(false));
  };

  return (
    <Modal eyebrow="New Resource" title="Invite User" onClose={onClose} onSubmit={handleSubmit} submitLabel={submitting ? 'Sending…' : 'Send Invite'}>
      <div className="modal-field">
        <label>Full Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Priya Nair" />
      </div>
      <div className="modal-field">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="priya.n@organization.com" />
      </div>
      <div className="modal-field">
        <label>Organization</label>
        <select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
      </div>
      <div className="modal-field">
        <label>Role</label>
        <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
          {allowedRoles.map((r) => (
            <option key={r} value={r}>{ROLE_META[r].label}</option>
          ))}
        </select>
      </div>
    </Modal>
  );
}

function ChangeRoleModal({ user, onClose, onSaved }) {
  const [userRole, setUserRole] = useState(user.role);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    updateUser(user.id, { org_id: user.org_id, name: user.name, email: user.email, role: userRole })
      .then(() => {
        onSaved();
        onClose();
      })
      .catch(() => message.error('Failed to update role'))
      .finally(() => setSubmitting(false));
  };

  return (
    <Modal eyebrow="Update Resource" title={`Change Role — ${user.name}`} onClose={onClose} onSubmit={handleSubmit} submitLabel={submitting ? 'Saving…' : 'Save'}>
      <div className="modal-field">
        <label>Role</label>
        <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
          {Object.keys(ROLE_META).map((r) => (
            <option key={r} value={r}>{ROLE_META[r].label}</option>
          ))}
        </select>
      </div>
    </Modal>
  );
}

function Team() {
  const { role } = useRole();
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);

  const loadAll = () =>
    Promise.all([getAllUsers(), getAllOrganizations()]).then(([usersRes, orgsRes]) => {
      setUsers(usersRes.data.data);
      setOrganizations(orgsRes.data.data);
    });

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, []);

  const handleRemove = (id) => {
    deleteUser(id)
      .then(loadAll)
      .catch(() => message.error('Failed to remove user — they may still own projects or tasks'));
  };

  if (loading) {
    return (
      <AppShell>
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />
      </AppShell>
    );
  }

  const allowedRoles = role === 'super_admin' ? ['org_admin', 'manager', 'member'] : ['manager', 'member'];

  return (
    <AppShell>
      <PageHeader
        eyebrow={ROLE_META[role].eyebrow}
        title="Team"
        action={
          <button className="btn-amber" onClick={() => setInviteOpen(true)}>
            + Invite User
          </button>
        }
      />

      <table className="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Organization</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="row-user">
                  <Stamp size="sm" name={user.name} role={user.role} />
                  {user.name}
                </div>
              </td>
              <td>{user.email}</td>
              <td>{user.org_name}</td>
              <td>
                <span className={`pill role-${user.role}`}>{ROLE_META[user.role]?.label || user.role}</span>
              </td>
              <td className="actions-cell">
                <button className="btn-ghost neutral" onClick={() => setRoleTarget(user)}>Change Role</button>
                <Popconfirm title="Remove this user?" onConfirm={() => handleRemove(user.id)}>
                  <button className="btn-ghost">Remove</button>
                </Popconfirm>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {inviteOpen && (
        <InviteUserModal
          organizations={organizations}
          allowedRoles={allowedRoles}
          onClose={() => setInviteOpen(false)}
          onCreated={loadAll}
        />
      )}
      {roleTarget && (
        <ChangeRoleModal user={roleTarget} onClose={() => setRoleTarget(null)} onSaved={loadAll} />
      )}
    </AppShell>
  );
}

export default Team;
