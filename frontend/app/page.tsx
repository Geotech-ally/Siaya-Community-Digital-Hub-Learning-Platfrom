import { redirect } from 'next/navigation';

// Landing simply forwards to the sign-in flow; middleware.ts takes it from
// there once a session cookie exists.
export default function RootPage() {
  redirect('/login');
}
