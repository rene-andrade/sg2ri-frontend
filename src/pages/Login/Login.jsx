import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_USERS } from '../../services/authService';
import { USER_ROLE_LABELS } from '../../utils/constants';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = async (demoUser) => {
    setEmail(demoUser.email);
    setPassword('senha123');
    setErrorMsg('');
    setLoading(true);
    try {
      await login(demoUser.email, 'demo');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao entrar com usuário de demonstração.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mockup-card p-4 p-md-5 overflow-hidden">
      <div className="text-center mb-4">
        <div
          className="icon-box-blue shadow-sm mb-3 mx-auto"
          style={{ width: '60px', height: '60px', fontSize: '1.8rem', borderRadius: '1rem' }}
        >
          <i className="bi bi-building-check"></i>
        </div>
        <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.85rem' }}>
          Portal SG2RI
        </h2>
        <span className="config-label text-muted d-block">
          Sistema de Gestão de Reserva de Recursos e Instalações
        </span>
      </div>

      {errorMsg && (
        <Alert
          variant="danger"
          className="py-2 small rounded-3 border-0 mb-4"
          style={{ backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)' }}
        >
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {errorMsg}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <Form.Group controlId="loginEmail">
          <Form.Label className="config-label mb-1">E-mail Institucional</Form.Label>
          <Form.Control
            type="email"
            placeholder="nome@sg2ri.edu.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="py-2"
          />
        </Form.Group>

        <Form.Group controlId="loginPassword">
          <Form.Label className="config-label mb-1">Senha de Acesso</Form.Label>
          <Form.Control
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="py-2"
          />
        </Form.Group>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-mockup-primary w-100 justify-content-center py-2 fs-6 shadow-sm"
          >
            {loading ? <Spinner size="sm" animation="border" /> : <i className="bi bi-box-arrow-in-right"></i>}
            <span>Autenticar no SG2RI</span>
          </button>
        </div>
      </Form>

      {/* Atalhos para Contas de Demonstração */}
      <div className="mt-4 pt-3 border-top" style={{ borderColor: 'var(--outline-variant-20)' }}>
        <div className="text-center mb-3">
          <span className="config-label text-muted">Acesso Rápido de Demonstração</span>
        </div>
        <div className="d-flex flex-column gap-2">
          {DEMO_USERS.map((demo) => (
            <button
              key={demo.id}
              type="button"
              className="btn-mockup-outline text-start d-flex align-items-center justify-content-between p-2 px-3 rounded-3 w-100"
              onClick={() => handleSelectDemo(demo)}
              disabled={loading}
              style={{ minHeight: 'auto' }}
            >
              <div>
                <div className="fw-bold text-dark small">{demo.name}</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                  {demo.email}
                </div>
              </div>
              <span className="config-label text-primary">
                {USER_ROLE_LABELS[demo.role]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;
