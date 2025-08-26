import { render, screen } from '@testing-library/react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import App from './App';

test('renders header title', () => {
  render(
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  );
  const heading = screen.getAllByText(/PosterScoop/i)[0];
  expect(heading).toBeInTheDocument();
});
