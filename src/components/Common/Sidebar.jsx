import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../utils/constants';

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const navClass = ({ isActive }) =>
    `sidebar-nav-btn ${isActive ? 'active' : ''}`;

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          className="sidebar-backdrop d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      <aside
        className={`mockup-sidebar d-print-none ${isOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}
        aria-label="Menu Principal de Navegação"
      >
        <div className="d-flex flex-column gap-1">
          {/* Dashboard */}
          <NavLink to="/" className={navClass} end onClick={() => window.innerWidth < 768 && onClose()}>
            <i className="bi bi-grid fs-5"></i>
            <span>Dashboard</span>
          </NavLink>

          {/* Nova Reserva */}
          <NavLink
            to="/nova-reserva"
            className={navClass}
            onClick={() => window.innerWidth < 768 && onClose()}
          >
            <i className="bi bi-pencil fs-5"></i>
            <span>Nova Reserva</span>
          </NavLink>

          {/* Minhas Reservas */}
          <NavLink to="/minhas-reservas" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
            <i className="bi bi-folder fs-5"></i>
            <span>Minhas Reservas</span>
          </NavLink>

          {/* Calendário */}
          <NavLink to="/calendario" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
            <i className="bi bi-calendar3 fs-5"></i>
            <span>Calendário</span>
          </NavLink>

          {/* Itens exclusivos de Administrador */}
          {isAdmin && (
            <>
              <NavLink to="/admin/aprovacoes" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
                <i className="bi bi-inbox fs-5"></i>
                <span>Solicitações</span>
              </NavLink>

              <NavLink to="/admin/relatorios" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
                <i className="bi bi-bar-chart-line fs-5"></i>
                <span>Relatórios</span>
              </NavLink>

              <NavLink to="/admin/itens" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
                <i className="bi bi-box-seam fs-5"></i>
                <span>Itens Reserváveis</span>
              </NavLink>
            </>
          )}

          {/* Configurações */}
          <NavLink to="/configuracoes" className={navClass} onClick={() => window.innerWidth < 768 && onClose()}>
            <i className="bi bi-gear fs-5"></i>
            <span>Configurações</span>
          </NavLink>
        </div>

        {/* Rodapé da Sidebar: Botão Sair em Card Branco e Copyright */}
        <div className="d-flex flex-column gap-3 pt-3">
          <button
            type="button"
            className="btn-mockup-sair"
            onClick={logout}
          >
            <i className="bi bi-box-arrow-right fs-5 text-danger"></i>
            <span>Sair</span>
          </button>

          <div className="text-white-50 small ps-2" style={{ fontSize: '0.72rem', opacity: 0.6 }}>
            &copy; 2026 SG2RI v1.0
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
