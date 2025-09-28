import { redirect } from 'react-router';
import { $path } from 'safe-routes';
import { destroySessionCookie } from '../lib/auth';

export async function action() {
  const cookie = destroySessionCookie();

  return redirect($path('/'), {
    headers: {
      'Set-Cookie': cookie,
    },
  });
}

export async function loader() {
  return redirect($path('/'));
}
