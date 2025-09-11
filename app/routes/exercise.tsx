import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => {
  return [{ title: 'Exercise - Noble Human' }, { name: 'description', content: 'Exercises at Noble Human' }];
};

export default function Exercise() {
  return (
    <div>
      <h1>Exercise</h1>
    </div>
  );
}
