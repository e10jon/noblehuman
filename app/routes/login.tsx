import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => {
  return [{ title: 'Login - Noble Human' }, { name: 'description', content: 'Login to Noble Human' }];
};

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
    </div>
  );
}
