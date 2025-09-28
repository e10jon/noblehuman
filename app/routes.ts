import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('login', './routes/login.tsx'),
  route('signup', './routes/signup.tsx'),
  route('logout', './routes/logout.tsx'),
  route('profile', './routes/profile.tsx'),
  route('exercise/:id', './routes/exercise.$id.tsx'),
  route('api/chat', './routes/api.chat.ts'),
  route('api/save-result', './routes/api.save-result.ts'),
  route('admin', './routes/admin.tsx'),
  route('admin/users', './routes/admin.users.tsx'),
  route('admin/users/:id', './routes/admin.users.$id.tsx'),
  route('admin/exercises', './routes/admin.exercises.tsx'),
  route('admin/exercises/new', './routes/admin.exercises.new.tsx'),
  route('admin/exercises/:id', './routes/admin.exercises.$id.tsx'),
  route('admin/settings', './routes/admin.settings.tsx'),
] satisfies RouteConfig;
