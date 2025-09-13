import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('login', './routes/login.tsx'),
  route('signup', './routes/signup.tsx'),
  route('logout', './routes/logout.tsx'),
  route('profile', './routes/profile.tsx'),
  route('exercise/:id', './routes/exercise.$id.tsx'),
  route('api/chat', './routes/api.chat.ts'),
] satisfies RouteConfig;
