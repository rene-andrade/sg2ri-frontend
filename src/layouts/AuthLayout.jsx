import React from 'react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between bg-auth-gradient">
      <div className="container py-5 my-auto">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <Outlet />
          </div>
        </div>
      </div>

      <footer className="text-center py-3 text-white-50 small">
        &copy; {new Date().getFullYear()} SG2RI - Sistema de Gestão e Reserva de Instalações
      </footer>
    </div>
  );
}

export default AuthLayout;
