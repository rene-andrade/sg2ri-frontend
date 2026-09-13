import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';

// Páginas
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import CalendarioPage from '../pages/Calendario/CalendarioPage';
import MinhasReservas from '../pages/Reservas/MinhasReservas';
import NovaReserva from '../pages/Reservas/NovaReserva';
import AprovaReservas from '../pages/Admin/AprovaReservas';
import GerenciarItens from '../pages/Admin/GerenciarItens';
import Relatorios from '../pages/Admin/Relatorios';
import Configuracoes from '../pages/Configuracoes/Configuracoes';
import NotFound from '../pages/NotFound';

import { USER_ROLES } from '../utils/constants';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas com AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Rotas Protegidas com AppLayout */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/minhas-reservas" element={<MinhasReservas />} />
        <Route path="/nova-reserva" element={<NovaReserva />} />
        <Route path="/configuracoes" element={<Configuracoes />} />

        {/* Rotas Exclusivas para Perfil Administrador */}
        <Route
          path="/admin/aprovacoes"
          element={
            <PrivateRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AprovaReservas />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/itens"
          element={
            <PrivateRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <GerenciarItens />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/relatorios"
          element={
            <PrivateRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <Relatorios />
            </PrivateRoute>
          }
        />

        {/* Rota 404 dentro do layout autenticado */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
