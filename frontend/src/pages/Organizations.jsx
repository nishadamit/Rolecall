import { useEffect, useState } from 'react';
import { Spin, message, Popconfirm } from 'antd';
import { getAllOrganizations, createOrganization, deleteOrganization } from '../api/organizations';
import { createUser } from '../api/users';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { ROLE_META, useRole } from '../context/RoleContext';

function CreateOrgModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !adminName || !adminEmail) return;
    setSubmitting(true);
    createOrganization({ name })
      .then((res) => {
        const orgId = res.data.data.id;
        return createUser({ org_id: orgId, name: adminName, email: adminEmail, role: 'org_admin' });
      })
      .then(() => {
        onCreated();
        onClose();
      })
      .catch(() => message.error('Failed to create organization'))
      .finally(() => setSubmitting(false));
  };

  return (
    <Modal eyebrow="New Resource" title="Create Organization" onClose={onClose} onSubmit={handleSubmit} submitLabel={submitting ? 'Creating…' : 'Create Organization'}>
      <div className="modal-field">
        <label>Organization Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Meridian Health Group" />
      </div>
      <div className="modal-field">
        <label>First Org Admin — Name</label>
        <input value={adminName} onChange={(e) => setAdminName(e.target.value)} required placeholder="e.g. Priya Nair" />
      </div>
      <div className="modal-field">
        <label>First Org Admin — Email</label>
        <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required placeholder="priya.n@meridian.health" />
      </div>
    </Modal>
  );
}

function Organizations() {
  const { role } = useRole();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadAll = () => getAllOrganizations().then((res) => setOrganizations(res.data.data));

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    deleteOrganization(id)
      .then(loadAll)
      .catch(() => message.error('Failed to delete organization — it may still have users or projects'));
  };

  if (loading) {
    return (
      <AppShell>
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow={ROLE_META[role].eyebrow}
        title="Organizations"
        action={
          <button className="btn-amber" onClick={() => setModalOpen(true)}>
            + New Organization
          </button>
        }
      />

      <table className="data-table">
        <thead>
          <tr>
            <th>Organization</th>
            <th>Users</th>
            <th>Projects</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr key={org.id}>
              <td className="row-title">{org.name}</td>
              <td>{org.user_count}</td>
              <td>{org.project_count}</td>
              <td>{new Date(org.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</td>
              <td className="actions-cell">
                <button className="btn-ghost neutral">Manage</button>
                <Popconfirm title="Delete this organization?" onConfirm={() => handleDelete(org.id)}>
                  <button className="btn-ghost">Delete</button>
                </Popconfirm>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && <CreateOrgModal onClose={() => setModalOpen(false)} onCreated={loadAll} />}
    </AppShell>
  );
}

export default Organizations;
