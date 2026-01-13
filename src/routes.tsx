import HomePage from './pages/HomePage';
import CameraInputPage from './pages/CameraInputPage';
import ManualInputPage from './pages/ManualInputPage';
import OptimizationResultsPage from './pages/OptimizationResultsPage';
import MaterialDatabasePage from './pages/MaterialDatabasePage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />
  },
  {
    name: 'Camera Input',
    path: '/camera/:projectId',
    element: <CameraInputPage />,
    visible: false
  },
  {
    name: 'Manual Input',
    path: '/manual/:projectId',
    element: <ManualInputPage />,
    visible: false
  },
  {
    name: 'Optimization Results',
    path: '/optimize/:projectId',
    element: <OptimizationResultsPage />,
    visible: false
  },
  {
    name: 'Material Database',
    path: '/materials',
    element: <MaterialDatabasePage />
  }
];

export default routes;
