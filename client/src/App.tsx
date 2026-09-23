import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/routes/ErrorBoundary';
import { ThemeProvider } from '@/context/ThemeContext';
import { SiteProvider } from '@/context/SiteContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider } from '@/context/AuthContext';
import { ClientProvider } from '@/context/ClientContext';
import { AppRoutes } from '@/routes/AppRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ThemeProvider>
          <SiteProvider>
            <NotificationProvider>
              <AuthProvider>
                <ClientProvider>
                  <AppRoutes />
                </ClientProvider>
              </AuthProvider>
            </NotificationProvider>
          </SiteProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}