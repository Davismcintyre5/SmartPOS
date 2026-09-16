import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SiteProvider } from './context/SiteContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <SiteProvider>
            <AuthProvider>
              <CartProvider>
                <AppRoutes />
              </CartProvider>
            </AuthProvider>
          </SiteProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}