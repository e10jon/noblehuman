import { redirect } from 'react-router';
import { destroySessionCookie } from '../lib/auth';

export async function action() {
  const cookie = destroySessionCookie();

  return redirect('/', {
    headers: {
      'Set-Cookie': cookie,
    },
  });
}

export async function loader() {
  return redirect('/');
}
