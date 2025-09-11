import type React from 'react';
import { Route, Routes } from 'react-router';

const App: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Noble Human</h1>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  );
};

const HomePage: React.FC = () => {
  return (
    <div>
      <h2>Home Page</h2>
      <p>Your TypeScript React Router 7 app is ready!</p>
    </div>
  );
};

export default App;
