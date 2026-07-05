import { createContext, useContext, useState } from 'react';

export const ROLE_META = {
  super_admin: { label: 'Super Admin', short: 'SA', eyebrow: 'Clearance: Super Admin Tier' },
  org_admin: { label: 'Org Admin', short: 'OA', eyebrow: 'Clearance: Org Admin Tier' },
  manager: { label: 'Manager', short: 'MGR', eyebrow: 'Clearance: Manager Tier' },
  member: { label: 'Member', short: 'MEM', eyebrow: 'Clearance: Member Tier — Read Only' },
};

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState('super_admin');
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
