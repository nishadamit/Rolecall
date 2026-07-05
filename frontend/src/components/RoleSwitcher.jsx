import { ROLE_META, useRole } from '../context/RoleContext';

function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="role-switcher">
      <div className="role-switcher-label">Preview as:</div>
      <div className="role-pills">
        {Object.entries(ROLE_META).map(([key, meta]) => (
          <button
            key={key}
            type="button"
            className={`role-pill${key === role ? ' active' : ''}`}
            onClick={() => setRole(key)}
          >
            {meta.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RoleSwitcher;
