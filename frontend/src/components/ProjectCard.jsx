import { Link } from 'react-router-dom';
import Stamp from './Stamp';

function ProjectCard({ project, tasks }) {
  const projectTasks = tasks.filter((task) => task.project_id === project.id);
  const doneCount = projectTasks.filter((task) => task.status === 'done').length;
  const totalCount = projectTasks.length;
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const assignees = [
    ...new Map(
      projectTasks.filter((task) => task.assigned_to).map((task) => [task.assigned_to, task.assigned_name])
    ).entries(),
  ];

  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <Stamp className="corner-stamp" size="sm" name={project.manager_name} role={project.manager_role} />
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
      </div>
      <div className="card-footer">
        <span>
          {doneCount} / {totalCount} tasks
        </span>
        <div className="avatar-stack">
          {assignees.slice(0, 3).map(([userId, name]) => (
            <Stamp key={userId} size="sm" name={name} role="member" />
          ))}
        </div>
      </div>
    </Link>
  );
}

export default ProjectCard;
