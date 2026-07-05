import { useEffect, useState } from 'react';
import { Spin, Empty } from 'antd';
import { getAllProjects } from '../api/projects';
import { getAllTasks } from '../api/tasks';
import { getAllOrganizations } from '../api/organizations';
import { getAllUsers } from '../api/users';
import ProjectCard from '../components/ProjectCard';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { ROLE_META, useRole } from '../context/RoleContext';

const buildTiles = (role, stats) => {
  const tiles = {
    super_admin: [
      { label: 'Organizations', value: stats.totalOrgs, color: 'var(--pink)' },
      { label: 'Total Users', value: stats.totalUsers, color: 'var(--green)' },
      { label: 'Total Projects', value: stats.totalProjects, color: 'var(--amber)' },
      { label: 'Active Tasks', value: stats.activeTasks, color: 'var(--slate-400)' },
    ],
    org_admin: [
      { label: 'Total Users', value: stats.totalUsers, color: 'var(--green)' },
      { label: 'Total Projects', value: stats.totalProjects, color: 'var(--amber)' },
      { label: 'Active Tasks', value: stats.activeTasks, color: 'var(--slate-400)' },
      { label: 'Completed Tasks', value: stats.doneTasks, color: 'var(--pink)' },
    ],
    manager: [
      { label: 'Total Projects', value: stats.totalProjects, color: 'var(--amber)' },
      { label: 'Active Tasks', value: stats.activeTasks, color: 'var(--slate-400)' },
      { label: 'Completed Tasks', value: stats.doneTasks, color: 'var(--green)' },
      { label: 'Total Users', value: stats.totalUsers, color: 'var(--pink)' },
    ],
    member: [
      { label: 'Active Tasks', value: stats.activeTasks, color: 'var(--amber)' },
      { label: 'Completed Tasks', value: stats.doneTasks, color: 'var(--green)' },
      { label: 'Total Projects', value: stats.totalProjects, color: 'var(--slate-400)' },
      { label: 'Total Users', value: stats.totalUsers, color: 'var(--pink)' },
    ],
  };
  return tiles[role];
};

function Dashboard() {
  const { role } = useRole();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllProjects(), getAllTasks(), getAllOrganizations(), getAllUsers()])
      .then(([projectsRes, tasksRes, orgsRes, usersRes]) => {
        setProjects(projectsRes.data.data);
        setTasks(tasksRes.data.data);
        setOrganizations(orgsRes.data.data);
        setUsers(usersRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />
      </AppShell>
    );
  }

  const doneTasks = tasks.filter((task) => task.status === 'done').length;
  const stats = {
    totalOrgs: organizations.length,
    totalUsers: users.length,
    totalProjects: projects.length,
    doneTasks,
    activeTasks: tasks.length - doneTasks,
  };
  const tiles = buildTiles(role, stats);
  const recentProjects = projects.slice(0, 3);

  return (
    <AppShell>
      <PageHeader eyebrow={ROLE_META[role].eyebrow} title="Overview" />

      <div className="tile-grid">
        {tiles.map((tile) => (
          <div className="tile" style={{ '--tile-color': tile.color }} key={tile.label}>
            <div className="tile-value">{tile.value}</div>
            <div className="tile-label">{tile.label}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Recent Projects</div>
      {recentProjects.length === 0 ? (
        <Empty description="No projects yet" />
      ) : (
        <div className="project-grid">
          {recentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} tasks={tasks} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default Dashboard;
