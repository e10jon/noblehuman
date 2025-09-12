import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('login', './routes/login.tsx'),
  route('signup', './routes/signup.tsx'),
  route('logout', './routes/logout.tsx'),
  route('profile', './routes/profile.tsx'),
] satisfies RouteConfig;
