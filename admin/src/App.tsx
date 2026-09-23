import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Toast } from '@/components/ui/Toast';
import { AppRoutes } from '@/routes/AppRoutes';

const router = createBrowserRouter(AppRoutes);

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toast />
      </AuthProvider>
    </NotificationProvider>
  );
}