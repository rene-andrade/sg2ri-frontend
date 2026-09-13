import React from 'react';
import { useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../utils/constants';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const handleOpenReserva = (tipoPref = 'SALA') => {
    navigate('/nova-reserva', { state: { tipoPreferido: tipoPref } });
  };

  return (
    <div className="d-flex flex-column gap-5 py-2">
      {/* ====================================================================
          VISÃO ADMINISTRATIVA (MARCOS) - Mockup Imagem 2
          ==================================================================== */}
      {isAdmin ? (
        <>
          {/* Header com botão Nova Reserva */}
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mockup-heading fs-2 mb-0">Dashboard Administrativo</h1>
            <button
              type="button"
              className="btn-mockup-primary"
              onClick={() => handleOpenReserva('SALA')}
            >
              <i className="bi bi-plus fs-5"></i>
              <span>Nova Reserva</span>
            </button>
          </div>

          {/* Linha 1: 3 Cards */}
          <Row className="g-4">
            {/* Card 1: Reservas Ativas */}
            <Col xs={12} md={4}>
              <div className="mockup-card p-4 h-100 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="icon-box-blue">
                    <i className="bi bi-calendar3"></i>
                  </div>
                  <span className="mockup-badge-blue">
                    +12% vs mês anterior
                  </span>
                </div>
                <div>
                  <div className="text-secondary small fw-medium mb-1">Reservas Ativas</div>
                  <div className="mockup-heading display-5 fw-bold text-dark">24</div>
                </div>
              </div>
            </Col>

            {/* Card 2: Manutenções Pendentes */}
            <Col xs={12} md={4}>
              <div className="mockup-card p-4 h-100 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="icon-box-red">
                    <i className="bi bi-wrench"></i>
                  </div>
                  <span className="mockup-badge-peach">
                    Atenção
                  </span>
                </div>
                <div>
                  <div className="text-secondary small fw-medium mb-1">Manutenções Pendentes</div>
                  <div className="mockup-heading display-5 fw-bold text-dark">08</div>
                </div>
              </div>
            </Col>

            {/* Card 3: Último Item Utilizado (Dark Navy Card) */}
            <Col xs={12} md={4}>
              <div className="mockup-card-dark p-4 h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-start mb-3">
                  <div className="p-2 rounded-3 text-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                    <i className="bi bi-clipboard-check fs-4"></i>
                  </div>
                </div>
                <div>
                  <div className="text-white-50 small fw-medium mb-1">Último Item Utilizado</div>
                  <div className="mockup-heading text-white fs-4 fw-bold mb-1">Projetor Epson X14</div>
                  <div className="text-white-50 small">Pela equipe de Marketing</div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Linha 2: Tabela Próximas Reservas */}
          <div className="mockup-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mockup-heading mb-0">Próximas Reservas</h5>
              <button
                type="button"
                className="btn btn-link text-decoration-none p-0 text-primary small fw-semibold"
                onClick={() => navigate('/admin/aprovacoes')}
              >
                Ver todas
              </button>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0 text-nowrap">
                <thead>
                  <tr className="text-muted small" style={{ borderBottom: '1px solid #eef1f6' }}>
                    <th className="py-2 fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>EQUIPAMENTO</th>
                    <th className="py-2 fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>RESPONSÁVEL</th>
                    <th className="py-2 fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>DATA E HORA</th>
                    <th className="py-2 fw-semibold text-end pe-3" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Linha 1 */}
                  <tr>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-box-blue" style={{ width: '38px', height: '38px', fontSize: '1rem' }}>
                          <i className="bi bi-laptop"></i>
                        </div>
                        <span className="fw-bold text-dark">MacBook Pro M2 #12</span>
                      </div>
                    </td>
                    <td className="text-secondary small">Ana Clara (Design)</td>
                    <td className="text-secondary small">Hoje, 14:00 - 18:00</td>
                    <td className="text-end pe-3">
                      <span className="mockup-badge-blue">CONFIRMADO</span>
                    </td>
                  </tr>

                  {/* Linha 2 */}
                  <tr>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-box-blue" style={{ width: '38px', height: '38px', fontSize: '1rem' }}>
                          <i className="bi bi-camera-video"></i>
                        </div>
                        <span className="fw-bold text-dark">Câmera Sony Alpha</span>
                      </div>
                    </td>
                    <td className="text-secondary small">João Paulo (Mídia)</td>
                    <td className="text-secondary small">Amanhã, 09:00 - 12:00</td>
                    <td className="text-end pe-3">
                      <span className="mockup-badge-blue">CONFIRMADO</span>
                    </td>
                  </tr>

                  {/* Linha 3 */}
                  <tr>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-box-blue" style={{ width: '38px', height: '38px', fontSize: '1rem' }}>
                          <i className="bi bi-mic"></i>
                        </div>
                        <span className="fw-bold text-dark">Kit Podcast Shure</span>
                      </div>
                    </td>
                    <td className="text-secondary small">Beatriz S. (RH)</td>
                    <td className="text-secondary small">24 Out, 15:30</td>
                    <td className="text-end pe-3">
                      <span className="mockup-badge-peach">PENDENTE</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ====================================================================
           VISÃO DOCENTE / USUÁRIO (PROFA. HELENA) - Mockup Imagem 1
           ==================================================================== */
        <>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mockup-heading fs-2 mb-0">Dashboard</h1>
          </div>

          {/* Linha 1: 3 Cards */}
          <Row className="g-4">
            <Col xs={12} md={4}>
              <div className="mockup-card p-4 h-100">
                <div className="text-secondary small fw-medium mb-1">Minhas Reservas Ativas</div>
                <div className="mockup-heading display-5 fw-bold text-dark">3</div>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="mockup-card p-4 h-100">
                <div className="text-secondary small fw-medium mb-1">Solicitações Pendentes</div>
                <div className="mockup-heading display-5 fw-bold text-dark">1</div>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="mockup-card p-4 h-100">
                <div className="text-secondary small fw-medium mb-1">Último Item Utilizado</div>
                <div className="mockup-heading fs-3 fw-bold text-dark mt-1">Lab Biologia 2</div>
              </div>
            </Col>
          </Row>

          {/* Linha 2: Minhas Próximas Reservas */}
          <div>
            <h5 className="mockup-heading mb-3">Minhas Próximas Reservas</h5>
            <Row className="g-4">
              {/* Card 1: Espaço */}
              <Col xs={12} md={6}>
                <div className="mockup-card p-4 d-flex flex-column justify-content-between" style={{ minHeight: '160px' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="icon-box-blue">
                      <i className="bi bi-building"></i>
                    </div>
                    <div>
                      <div className="fw-bold text-dark fs-6">Espaço</div>
                      <div className="text-secondary small">Laboratório de Biologia A</div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 text-secondary small flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-3">
                      <span><i className="bi bi-calendar3 me-1"></i>Terça-feira, 24/10</span>
                      <span><i className="bi bi-clock me-1"></i>08:00 - 10:00</span>
                    </div>
                    <span className="pill-confirmada">Confirmada</span>
                  </div>
                </div>
              </Col>

              {/* Card 2: Equipamento */}
              <Col xs={12} md={6}>
                <div className="mockup-card p-4 d-flex flex-column justify-content-between" style={{ minHeight: '160px' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="icon-box-blue">
                      <i className="bi bi-projector"></i>
                    </div>
                    <div>
                      <div className="fw-bold text-dark fs-6">Equipamento</div>
                      <div className="text-secondary small">Projetor Epson X14</div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 text-secondary small flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-3">
                      <span><i className="bi bi-calendar3 me-1"></i>Quarta-feira, 25/10</span>
                      <span><i className="bi bi-clock me-1"></i>14:00 - 16:00</span>
                    </div>
                    <span className="pill-pendente">Pendente</span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Linha 3: Ações Rápidas */}
          <div>
            <h5 className="mockup-heading mb-3">Ações Rápidas</h5>
            <Row className="g-4">
              <Col xs={12} md={6}>
                <button
                  type="button"
                  className="btn-action-wide"
                  onClick={() => handleOpenReserva('SALA')}
                >
                  <i className="bi bi-plus-circle fs-5"></i>
                  <span>Nova Reserva de Espaço</span>
                </button>
              </Col>

              <Col xs={12} md={6}>
                <button
                  type="button"
                  className="btn-action-wide"
                  onClick={() => handleOpenReserva('EQUIPAMENTO')}
                >
                  <i className="bi bi-tag fs-5"></i>
                  <span>Nova Reserva de Equipamento</span>
                </button>
              </Col>
            </Row>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
