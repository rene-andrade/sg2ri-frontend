import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import { USER_ROLE_LABELS } from '../../utils/constants';

export function Header({ onToggleSidebar, isSidebarOpen = true }) {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'US';
    if (user?.initials) return user.initials;
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Navbar expand="lg" className="mockup-header sticky-top px-3 py-0 d-print-none">
      <Container fluid className="px-0 d-flex align-items-center justify-content-between">
        {/* Esquerda: Logo com Espiral Estilizado SG2RI e Botão Toggle */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm text-white border-0 p-1 d-flex align-items-center justify-content-center"
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? 'Recolher menu' : 'Expandir menu'}
            aria-label="Alternar menu lateral"
            style={{ opacity: 0.85 }}
          >
            <i className={`bi ${isSidebarOpen ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar'} fs-5`}></i>
          </button>

          <Navbar.Brand href="/" className="d-flex align-items-center gap-2 m-0 text-decoration-none">
            {/* Ícone Espiral do Mockup */}
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 4C9.37 4 4 9.37 4 16C4 20.42 6.4 24.28 10 26.33M16 28C22.63 28 28 22.63 28 16C28 11.58 25.6 7.72 22 5.67M10 11C7.79 11 6 12.79 6 15C6 17.21 7.79 19 10 19C12.21 19 14 17.21 14 15C14 12.79 12.21 11 10 11ZM22 21C24.21 21 26 19.21 26 17C26 14.79 24.21 13 22 13C19.79 13 18 14.79 18 17C18 19.21 19.79 21 22 21Z"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
            <span className="mockup-logo-text">SG2RI</span>
          </Navbar.Brand>
        </div>

        {/* Direita: Saudação do Usuário e Avatar Circular */}
        <Nav className="align-items-center">
          {user ? (
            <NavDropdown
              title={
                <div className="d-inline-flex align-items-center gap-3 text-start">
                  <div className="d-flex flex-column text-end line-height-1">
                    <span className="text-white-50" style={{ fontSize: '0.72rem' }}>Olá,</span>
                    <span className="fw-semibold text-white small">{user.name}</span>
                  </div>
                  <div className="avatar-circle shadow-sm p-0 overflow-hidden">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                </div>
              }
              id="user-nav-dropdown"
              align="end"
            >
              <div className="px-3 py-2 border-bottom">
                <div className="fw-bold text-dark">{user.name}</div>
                <div className="small text-muted">{user.email}</div>
                <div className="small text-primary mt-1">
                  Perfil: <strong>{USER_ROLE_LABELS[user.role] || user.role}</strong>
                </div>
              </div>
              <NavDropdown.Item href="/minhas-reservas" className="d-flex align-items-center gap-2 py-2">
                <i className="bi bi-folder text-primary"></i>
                <span>Minhas Reservas</span>
              </NavDropdown.Item>

              <NavDropdown.Divider />
              <div className="px-3 py-1 text-muted small fw-semibold" style={{ fontSize: '0.7rem' }}>
                ALTERNAR VISÃO DO MOCKUP:
              </div>
              <NavDropdown.Item
                onClick={async () => {
                  try {
                    await authService.login('helena@sg2ri.edu.br', 'demo');
                    window.location.href = '/';
                  } catch (err) {
                    alert(err.message || 'Não foi possível alternar para esse usuário.');
                  }
                }}
                className="d-flex align-items-center gap-2 py-2 small"
              >
                <i className="bi bi-person text-secondary"></i>
                <span>Ver como <strong>Profa. Helena</strong> (Docente)</span>
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={async () => {
                  try {
                    await authService.login('marcos@sg2ri.edu.br', 'demo');
                    window.location.href = '/';
                  } catch (err) {
                    alert(err.message || 'Não foi possível alternar para esse usuário.');
                  }
                }}
                className="d-flex align-items-center gap-2 py-2 small"
              >
                <i className="bi bi-shield-check text-primary"></i>
                <span>Ver como <strong>Marcos</strong> (Administrador)</span>
              </NavDropdown.Item>

              <NavDropdown.Divider />
              <NavDropdown.Item
                onClick={logout}
                className="d-flex align-items-center gap-2 text-danger py-2"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Encerrar Sessão</span>
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            <Nav.Link href="/login" className="btn btn-outline-light btn-sm rounded-pill px-3">
              Entrar
            </Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;
