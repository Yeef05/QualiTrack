import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getToken } from '../api/client';
import { AuthProvider } from '../auth/AuthContext';
import { LoginPage } from './LoginPage';

function renderLogin() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<p>Dashboard</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('inicio de sesión', () => {
  it('entra al dashboard con credenciales válidas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ token: 'jwt', user: { id: 1, name: 'QA', email: 'qa@x.mx', role: 'lider_qa' } }),
      }),
    );
    renderLogin();
    await userEvent.type(screen.getByLabelText('Correo'), 'qa@x.mx');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreto');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(getToken()).toBe('jwt');
  });

  it('muestra el error cuando las credenciales son incorrectas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
        json: () => Promise.resolve({ error: 'Correo o contraseña incorrectos' }),
      }),
    );
    renderLogin();
    await userEvent.type(screen.getByLabelText('Correo'), 'qa@x.mx');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mal');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
    expect(getToken()).toBeNull();
  });
});
