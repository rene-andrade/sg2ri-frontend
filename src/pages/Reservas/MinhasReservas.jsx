import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import { useAuth } from '../../hooks/useAuth';
import reservaService from '../../services/reservaService';
import ReservaTable from '../../components/Tables/ReservaTable';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import DetailModal from '../../components/Modals/DetailModal';
import Loading from '../../components/Common/Loading';

export function MinhasReservas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [reservaToCancel, setReservaToCancel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState(null);

  const fetchReservas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reservaService.getMinhasReservas(user?.id);
      setReservas(data);
    } catch (err) {
      console.error(err);
      setAlertFeedback({ type: 'danger', message: 'Erro ao carregar suas reservas.' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setAlertFeedback({ type: 'success', message: location.state.successMessage });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleConfirmCancel = async () => {
    if (!reservaToCancel) return;
    setActionLoading(true);
    try {
      await reservaService.cancelarReserva(reservaToCancel.id);
      setReservaToCancel(null);
      setAlertFeedback({
        type: 'info',
        message: `A reserva #${reservaToCancel.id} foi cancelada.`,
      });
      fetchReservas();
    } catch (err) {
      setAlertFeedback({
        type: 'danger',
        message: err.message || 'Falha ao cancelar a reserva.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner */}
      <div className="mockup-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
        <div>
          <span className="config-label text-muted d-block">Painel do Solicitante</span>
          <h2 className="fw-bold text-dark mb-1">Minhas Reservas & Solicitações</h2>
          <p className="text-secondary small mb-0">
            Acompanhe o parecer administrativo dos seus pedidos de salas, laboratórios e equipamentos.
          </p>
        </div>

        <button
          type="button"
          className="btn-mockup-primary"
          onClick={() => navigate('/nova-reserva')}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Nova Solicitação</span>
        </button>
      </div>

      {/* Alerta de Feedback Tonal */}
      {alertFeedback && (
        <Alert
          variant={alertFeedback.type}
          dismissible
          onClose={() => setAlertFeedback(null)}
          className="rounded-4 border-0 shadow-sm"
          style={
            alertFeedback.type === 'success'
              ? { backgroundColor: 'var(--success-container)', color: 'var(--on-success-container)' }
              : alertFeedback.type === 'danger'
              ? { backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)' }
              : { backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface)' }
          }
        >
          <i className="bi bi-info-circle-fill me-2"></i>
          {alertFeedback.message}
        </Alert>
      )}

      {/* Tabela de Reservas */}
      {loading ? (
        <Loading message="Consultando suas reservas no sistema..." />
      ) : (
        <ReservaTable
          reservas={reservas}
          onViewDetails={(res) => setSelectedReserva(res)}
          onCancelReserva={(res) => setReservaToCancel(res)}
          emptyMessage="Você não possui solicitações ativas."
        />
      )}

      {/* Modal de Confirmação de Cancelamento */}
      <ConfirmModal
        show={!!reservaToCancel}
        title="Cancelar Reserva"
        message={`Deseja confirmar o cancelamento da reserva para "${reservaToCancel?.itemNome}" no dia ${reservaToCancel?.data}?`}
        confirmText="Confirmar Cancelamento"
        confirmVariant="danger"
        cancelText="Voltar"
        onConfirm={handleConfirmCancel}
        onCancel={() => setReservaToCancel(null)}
        loading={actionLoading}
      />

      {/* Modal de Detalhes da Reserva */}
      <DetailModal
        show={!!selectedReserva}
        onClose={() => setSelectedReserva(null)}
        data={selectedReserva}
        type="reserva"
      />
    </div>
  );
}

export default MinhasReservas;
