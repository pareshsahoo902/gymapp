import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Plan from './pages/Plan';
import Workout from './pages/Workout';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import BodyWeight from './pages/BodyWeight';

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'plan', element: <Plan /> },
      { path: 'workout', element: <Workout /> },
      { path: 'progress', element: <Progress /> },
      { path: 'bodyweight', element: <BodyWeight /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}