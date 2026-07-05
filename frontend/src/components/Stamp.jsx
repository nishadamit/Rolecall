const ROLE_CLASS = {
  manager: 'role-manager',
  org_admin: 'role-org_admin',
  super_admin: 'role-super_admin',
  member: 'role-member',
};

const initialsFromName = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

function Stamp({ name, label, role, size = 'md', className = '' }) {
  const roleClass = ROLE_CLASS[role] || 'role-member';

  return (
    <div className={`stamp ${size} ${roleClass} ${className}`.trim()}>
      {label || initialsFromName(name || '?')}
    </div>
  );
}

export default Stamp;
