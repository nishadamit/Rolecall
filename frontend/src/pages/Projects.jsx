import { useEffect, useState } from 'react';
import { Spin, Empty, message } from 'antd';
import { getAllProjects, createProject } from '../api/projects';
import { getAllTasks } from '../api/tasks';
import { getAllOrganizations } from '../api/organizations';
import { getAllUsers } from '../api/users';
import ProjectCard from '../components/ProjectCard';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { ROLE_META, useRole } from '../context/RoleContext';

function CreateProjectModal({ organizations, users, onClose, onCreated }) {
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? '');
  const [managerId, setManagerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const orgUsers = users.filter((user) => String(user.org_id) === String(orgId));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orgId || !managerId || !title) return;
    setSubmitting(true);
    createProject({ org_id: orgId, manager_id: managerId, title, description })
      .then(() => {
        onCreated();
        onClose();
      })
      .catch(() => message.error('Failed to create project'))
      .finally(() => setSubmitting(false));
  };

  return (
    <Modal eyebrow="New Resource" title="Create Project" onClose={onClose} onSubmit={handleSubmit} submitLabel={submitting ? 'Creating…' : 'Create Project'}>
      <div className="modal-field">
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Billing Dashboard Redesign" />
      </div>
      <div className="modal-field">
        <label>Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary of the project" />
      </div>
      <div className="modal-field">
        <label>Organization</label>
        <select value={orgId} onChange={(e) => { setOrgId(e.target.value); setManagerId(''); }}>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
      </div>
      <div className="modal-field">
        <label>Manager</label>
        <select value={managerId} onChange={(e) => setManagerId(e.target.value)} required>
          <option value="" disabled>Select a manager</option>
          {orgUsers.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>
    </Modal>
  );
}

function Projects() {
  const { role } = useRole();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadAll = () =>
    Promise.all([getAllProjects(), getAllTasks(), getAllOrganizations(), getAllUsers()]).then(
      ([projectsRes, tasksRes, orgsRes, usersRes]) => {
        setProjects(projectsRes.data.data);
        setTasks(tasksRes.data.data);
        setOrganizations(orgsRes.data.data);
        setUsers(usersRes.data.data);
      }
    );

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, []);

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
        title="Projects"
        action={
          role !== 'member' && (
            <button className="btn-amber" onClick={() => setModalOpen(true)}>
              + New Project
            </button>
          )
        }
      />

      {projects.length === 0 ? (
        <Empty description="No projects yet" style={{ marginTop: 48 }} />
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} tasks={tasks} />
          ))}
        </div>
      )}

      {modalOpen && (
        <CreateProjectModal
          organizations={organizations}
          users={users}
          onClose={() => setModalOpen(false)}
          onCreated={loadAll}
        />
      )}
    </AppShell>
  );
}

export default Projects;
