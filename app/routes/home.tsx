import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => {
  return [{ title: 'Noble Human' }, { name: 'description', content: 'Welcome to Noble Human!' }];
};

export default function Index() {
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
