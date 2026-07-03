import { useState } from 'react';
import { AdminLogin } from '../admin/AdminLogin';
import { AdminProvider, ADMIN_KEY } from '../admin/AdminContext';
import { AdminPanel } from '../admin/AdminPanel';

export function Admin() {
  const [secret, setSecret] = useState<string | null>(
    () => sessionStorage.getItem(ADMIN_KEY),
  );

  if (!secret) {
    return <AdminLogin onAuth={setSecret} />;
  }

  return (
    <AdminProvider secret={secret}>
      <AdminPanel />
    </AdminProvider>
  );
}
