import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('login', './routes/login.tsx'),
  route('exercise', './routes/exercise.tsx'),
] satisfies RouteConfig;
