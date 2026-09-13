import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5 text-center">
      <div className="mockup-card p-5" style={{ maxWidth: '540px' }}>
        <div
          className="icon-box-blue mb-3 mx-auto"
          style={{ width: '64px', height: '64px', fontSize: '2rem' }}
        >
          <i className="bi bi-compass"></i>
        </div>
        <div className="display-1 fw-bold text-primary mockup-heading mb-2">404</div>
        <h3 className="fw-bold text-dark mb-2">Página Não Encontrada</h3>
        <p className="text-muted mb-4 small" style={{ lineHeight: '1.6' }}>
          O endereço solicitado não existe ou você não possui autorização para visualizá-lo dentro do ecossistema SG2RI.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <button type="button" className="btn-mockup-outline" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
            <span>Voltar</span>
          </button>
          <button type="button" className="btn-mockup-primary" onClick={() => navigate('/')}>
            <i className="bi bi-house-door"></i>
            <span>Ir ao Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
