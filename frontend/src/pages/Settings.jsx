import { useEffect, useState } from 'react';
import { Spin, Empty, message } from 'antd';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import ProjectCard from '../components/ProjectCard';
import { ROLE_META, useRole } from '../context/RoleContext';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../api/users';
import { getAllProjects } from '../api/projects';
import { getAllTasks } from '../api/tasks';
import { STATUS_META } from '../constants/taskStatus';

function Settings() {
  const { role } = useRole();
  const { user, setUser, checked } = useAuth();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([getAllProjects(), getAllTasks()])
      .then(([projectsRes, tasksRes]) => {
        setProjects(projectsRes.data.data);
        setTasks(tasksRes.data.data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    updateUser(user.id, { org_id: user.org_id, name, email: user.email, role: user.role })
      .then(() => {
        setUser({ ...user, name });
        message.success('Profile updated');
      })
      .catch(() => message.error('Failed to update profile'))
      .finally(() => setSaving(false));
  };

  if (!checked || loading) {
    return (
      <AppShell>
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <PageHeader eyebrow={ROLE_META[role].eyebrow} title="Settings" />
        <Empty description="Not signed in" style={{ marginTop: 48 }} />
      </AppShell>
    );
  }

  const myProjects = projects.filter((project) => project.manager_id === user.id);
  const myTasks = tasks.filter((task) => task.assigned_to === user.id);

  return (
    <AppShell>
      <PageHeader eyebrow={ROLE_META[role].eyebrow} title="Settings" />

      <div className="settings-grid">
        <div className="settings-card">
          <h3>Profile</h3>
          <div className="card-sub">Your identity within Rolecall.</div>
          <form onSubmit={handleSaveProfile}>
            <div className="settings-field">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="settings-field">
              <label>Email</label>
              <input type="email" defaultValue={user.email} disabled />
            </div>
            <div className="settings-field">
              <label>Organization</label>
              <input type="text" defaultValue={user.org_name} disabled />
            </div>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
        <div className="settings-card">
          <h3>Password</h3>
          <div className="card-sub">Changing this signs you out of all other sessions. (Preview only.)</div>
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

      <div className="section-label" style={{ marginTop: 32 }}>
        My Projects
      </div>
      {myProjects.length === 0 ? (
        <Empty description="You don't manage any projects" />
      ) : (
        <div className="project-grid">
          {myProjects.map((project) => (
            <ProjectCard key={project.id} project={project} tasks={tasks} />
          ))}
        </div>
      )}

      <div className="section-label" style={{ marginTop: 32 }}>
        My Tasks
      </div>
      {myTasks.length === 0 ? (
        <Empty description="No tasks assigned to you" />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {myTasks.map((task) => {
              const status = STATUS_META[task.status] || STATUS_META.todo;
              const project = projects.find((p) => p.id === task.project_id);
              return (
                <tr key={task.id}>
                  <td className="row-title">{task.title}</td>
                  <td>{project?.title || '—'}</td>
                  <td>
                    <span className={`pill ${status.className}`}>{status.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </AppShell>
  );
}

export default Settings;
