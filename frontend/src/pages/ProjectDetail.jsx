import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spin, Empty, message } from 'antd';
import { getProjectById } from '../api/projects';
import { getAllTasks, createTask } from '../api/tasks';
import { getAllUsers } from '../api/users';
import Stamp from '../components/Stamp';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { ROLE_META, useRole } from '../context/RoleContext';

const STATUS_META = {
  todo: { className: 'todo', label: 'To Do' },
  in_progress: { className: 'progress', label: 'In Progress' },
  done: { className: 'done', label: 'Done' },
};

function CreateTaskModal({ projectId, orgUsers, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('todo');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);
    createTask({ project_id: projectId, assigned_to: assignedTo || null, title, status })
      .then(() => {
        onCreated();
        onClose();
      })
      .catch(() => message.error('Failed to create task'))
      .finally(() => setSubmitting(false));
  };

  return (
    <Modal eyebrow="New Resource" title="Create Task" onClose={onClose} onSubmit={handleSubmit} submitLabel={submitting ? 'Creating…' : 'Create Task'}>
      <div className="modal-field">
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Fix login redirect bug" />
      </div>
      <div className="modal-field">
        <label>Assignee</label>
        <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
          <option value="">Unassigned</option>
          {orgUsers.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>
      <div className="modal-field">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </Modal>
  );
}

function ProjectDetail() {
  const { role } = useRole();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadAll = () =>
    Promise.all([getProjectById(id), getAllTasks(), getAllUsers()]).then(([projectRes, tasksRes, usersRes]) => {
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data.filter((task) => task.project_id === Number(id)));
      setUsers(usersRes.data.data);
    });

  useEffect(() => {
    setLoading(true);
    loadAll().finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />
      </AppShell>
    );
  }

  const orgUsers = users.filter((user) => user.org_id === project.org_id);

  return (
    <AppShell>
      <Link to="/projects" className="breadcrumb">
        ← ALL PROJECTS
      </Link>
      <PageHeader
        eyebrow={ROLE_META[role].eyebrow}
        title={project.title}
        action={
          role !== 'member' && (
            <button className="btn-amber" onClick={() => setModalOpen(true)}>
              + New Task
            </button>
          )
        }
      />
      <p className="project-description">{project.description}</p>

      {tasks.length === 0 ? (
        <Empty description="No tasks yet" />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assignee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const status = STATUS_META[task.status] || STATUS_META.todo;
              return (
                <tr key={task.id}>
                  <td className="row-title">{task.title}</td>
                  <td>
                    {task.assigned_name ? (
                      <div className="assignee">
                        <Stamp size="sm" name={task.assigned_name} role="member" />
                        {task.assigned_name}
                      </div>
                    ) : (
                      'Unassigned'
                    )}
                  </td>
                  <td>
                    <span className={`pill ${status.className}`}>{status.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <CreateTaskModal
          projectId={project.id}
          orgUsers={orgUsers}
          onClose={() => setModalOpen(false)}
          onCreated={loadAll}
        />
      )}
    </AppShell>
  );
}

export default ProjectDetail;
