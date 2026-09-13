import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import reservaService from '../../services/reservaService';
import userService from '../../services/userService';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import DetailModal from '../../components/Modals/DetailModal';
import Loading from '../../components/Common/Loading';
import { CONDICAO_ITEM, CONDICAO_ITEM_LABELS, STATUS_RESERVA, TIPO_ITEM_ICONS } from '../../utils/constants';
import { getTodayISO, formatDateBR } from '../../utils/formatDate';

const FILTROS_STATUS = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'PENDENTE', label: 'Pendente' },
  { key: 'CONFIRMADO', label: 'Confirmado' },
  { key: 'EM_USO', label: 'Em Uso' },
  { key: 'CONCLUIDO', label: 'Concluído' },
  { key: 'RECUSADA', label: 'Recusado' },
  { key: 'CANCELADA', label: 'Cancelado' },
];

const PAGE_SIZE = 8;

function getStatusVisual(res) {
  if (res.status === STATUS_RESERVA.PENDENTE) return { key: 'PENDENTE', label: 'Pendente', color: '#f59e0b' };
  if (res.status === STATUS_RESERVA.RECUSADA) return { key: 'RECUSADA', label: 'Recusado', color: '#dc2626' };
  if (res.status === STATUS_RESERVA.CANCELADA) return { key: 'CANCELADA', label: 'Cancelado', color: '#94a3b8' };
  // APROVADA: o estágio depende do check-in/check-out do recurso
  if (res.devolvidoEm) return { key: 'CONCLUIDO', label: 'Concluído', color: '#64748b' };
  if (res.retiradoEm) return { key: 'EM_USO', label: 'Em Uso', color: '#0f172a' };
  return { key: 'CONFIRMADO', label: 'Confirmado', color: '#2563eb' };
}

function formatDataRelativa(dataISO) {
  const hoje = getTodayISO();
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const ontem = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (dataISO === hoje) return 'Hoje';
  if (dataISO === ontem) return 'Ontem';
  return formatDateBR(dataISO);
}

export function AprovaReservas() {
  const [reservas, setReservas] = useState([]);
  const [usuariosPorId, setUsuariosPorId] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Aprovação
  const [reservaToApprove, setReservaToApprove] = useState(null);
  const [approveNote, setApproveNote] = useState('');

  // Recusa
  const [reservaToReject, setReservaToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Check-in (início de uso) / Check-out (fim de uso)
  const [reservaParaCheckin, setReservaParaCheckin] = useState(null);
  const [reservaParaCheckout, setReservaParaCheckout] = useState(null);
  const [condicaoDevolucao, setCondicaoDevolucao] = useState(CONDICAO_ITEM.OK);
  const [observacaoDevolucao, setObservacaoDevolucao] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState(null);

  const fetchDados = useCallback(async () => {
    setLoading(true);
    try {
      const [resList, userList] = await Promise.all([
        reservaService.getReservas(),
        userService.getUsuarios(),
      ]);
      setReservas(resList);
      setUsuariosPorId(Object.fromEntries(userList.map((u) => [String(u.id), u])));
    } catch (err) {
      console.error(err);
      setAlertFeedback({ type: 'danger', message: 'Erro ao carregar solicitações.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, searchTerm]);

  const handleConfirmApprove = async () => {
    if (!reservaToApprove) return;
    setActionLoading(true);
    try {
      await reservaService.aprovarReserva(reservaToApprove.id, approveNote);
      setReservaToApprove(null);
      setApproveNote('');
      setAlertFeedback({ type: 'success', message: `Solicitação #${reservaToApprove.id} aprovada com sucesso!` });
      fetchDados();
    } catch (err) {
      setAlertFeedback({ type: 'danger', message: err.message || 'Falha ao aprovar a solicitação.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!reservaToReject) return;
    setActionLoading(true);
    try {
      await reservaService.recusarReserva(reservaToReject.id, rejectReason);
      setReservaToReject(null);
      setRejectReason('');
      setAlertFeedback({ type: 'warning', message: `Solicitação #${reservaToReject.id} recusada. O solicitante foi notificado.` });
      fetchDados();
    } catch (err) {
      setAlertFeedback({ type: 'danger', message: err.message || 'Falha ao recusar a solicitação.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCheckin = async () => {
    if (!reservaParaCheckin) return;
    setActionLoading(true);
    try {
      await reservaService.registrarRetirada(reservaParaCheckin.id);
      setReservaParaCheckin(null);
      setAlertFeedback({ type: 'success', message: `Check-in de "${reservaParaCheckin.itemNome}" registrado com sucesso.` });
      fetchDados();
    } catch (err) {
      setAlertFeedback({ type: 'danger', message: err.message || 'Falha ao registrar o check-in.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!reservaParaCheckout) return;
    if (condicaoDevolucao === CONDICAO_ITEM.DANIFICADO && !observacaoDevolucao.trim()) {
      setAlertFeedback({ type: 'danger', message: 'Descreva a avaria identificada antes de confirmar o check-out.' });
      return;
    }
    setActionLoading(true);
    try {
      await reservaService.registrarDevolucao(reservaParaCheckout.id, {
        condicao: condicaoDevolucao,
        observacao: observacaoDevolucao.trim(),
      });
      setReservaParaCheckout(null);
      setCondicaoDevolucao(CONDICAO_ITEM.OK);
      setObservacaoDevolucao('');
      setAlertFeedback({ type: 'success', message: `Check-out de "${reservaParaCheckout.itemNome}" registrado com sucesso.` });
      fetchDados();
    } catch (err) {
      setAlertFeedback({ type: 'danger', message: err.message || 'Falha ao registrar o check-out.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return reservas.filter((r) => {
      const matchStatus = filterStatus === 'TODOS' || getStatusVisual(r).key === filterStatus;
      const matchSearch =
        !term || r.usuarioNome?.toLowerCase().includes(term) || r.itemNome?.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [reservas, filterStatus, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="d-flex flex-column gap-4">
      {/* Cabeçalho */}
      <div>
        <span className="config-label text-muted d-block mb-1">Painel de Governança (RF03)</span>
        <h1 className="mockup-heading fs-2 mb-1">Gestão de Solicitações</h1>
        <p className="text-secondary mb-0">Visualize e gerencie todas as reservas do sistema.</p>
      </div>

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
              : { backgroundColor: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)' }
          }
        >
          {alertFeedback.message}
        </Alert>
      )}

      <div className="mockup-card p-4">
        {/* Filtros e busca */}
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 gap-lg-4 mb-4">
          <div>
            <span className="config-label text-muted d-block mb-2">Filtrar por Status</span>
            <div className="d-flex flex-wrap gap-2">
              {FILTROS_STATUS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`sol-filter-pill ${filterStatus === f.key ? 'sol-filter-pill--active' : ''}`}
                  onClick={() => setFilterStatus(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ minWidth: '240px' }}>
            <span className="config-label text-muted d-block mb-2">Pesquisar</span>
            <div className="position-relative">
              <i
                className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                style={{ fontSize: '0.85rem' }}
              ></i>
              <Form.Control
                type="text"
                placeholder="Usuário ou recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-5"
                style={{ borderRadius: '0.75rem', backgroundColor: '#f8fafc' }}
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <Loading message="Carregando solicitações para análise..." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="gu-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Recurso</th>
                    <th>Data e Hora</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                        Nenhuma solicitação encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((res) => {
                      const usuario = usuariosPorId[String(res.usuarioId)];
                      const iniciais = usuario?.initials || res.usuarioNome?.slice(0, 2).toUpperCase() || 'US';
                      const departamento = usuario?.department || '';
                      const visual = getStatusVisual(res);

                      return (
                        <tr
                          key={res.id}
                          className="gu-table__row sol-row"
                          onClick={() => setSelectedReserva(res)}
                        >
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className="sol-avatar">
                                {usuario?.avatarUrl ? (
                                  <img src={usuario.avatarUrl} alt={res.usuarioNome} />
                                ) : (
                                  iniciais
                                )}
                              </div>
                              <div>
                                <div className="fw-bold text-dark">{res.usuarioNome}</div>
                                {departamento && <div className="text-muted small">{departamento}</div>}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <i className={`bi ${TIPO_ITEM_ICONS[res.itemTipo] || 'bi-box-seam'} text-secondary`}></i>
                              <div>
                                <div className="fw-semibold text-dark">{res.itemNome}</div>
                                <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                                  #{res.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="fw-semibold text-dark">{formatDataRelativa(res.data)}</div>
                            <div className="text-muted small">{res.horario}</div>
                          </td>

                          <td>
                            <span className="d-inline-flex align-items-center">
                              <span className="sol-status-dot" style={{ backgroundColor: visual.color }}></span>
                              <span
                                className="text-uppercase small fw-bold"
                                style={{ color: visual.color, letterSpacing: '0.03em' }}
                              >
                                {visual.label}
                              </span>
                            </span>
                          </td>

                          <td className="text-end pe-3" onClick={(e) => e.stopPropagation()}>
                            <div className="d-inline-flex align-items-center gap-2">
                              {visual.key === 'PENDENTE' && (
                                <>
                                  <button
                                    type="button"
                                    className="sol-action-btn sol-action-btn--approve"
                                    title="Aprovar Solicitação"
                                    onClick={() => {
                                      setReservaToApprove(res);
                                      setApproveNote('Aprovado conforme normas institucionais.');
                                    }}
                                  >
                                    <i className="bi bi-check-lg"></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="sol-action-btn sol-action-btn--reject"
                                    title="Recusar Solicitação"
                                    onClick={() => {
                                      setReservaToReject(res);
                                      setRejectReason('');
                                    }}
                                  >
                                    <i className="bi bi-x-lg"></i>
                                  </button>
                                </>
                              )}

                              {visual.key === 'CONFIRMADO' && (
                                <button
                                  type="button"
                                  className="btn-mockup-primary py-1 px-3"
                                  style={{ fontSize: '0.8rem' }}
                                  onClick={() => setReservaParaCheckin(res)}
                                >
                                  <i className="bi bi-box-arrow-in-right"></i>
                                  <span>Check-in</span>
                                </button>
                              )}

                              {visual.key === 'EM_USO' && (
                                <button
                                  type="button"
                                  className="btn-mockup-primary py-1 px-3"
                                  style={{ fontSize: '0.8rem' }}
                                  onClick={() => {
                                    setReservaParaCheckout(res);
                                    setCondicaoDevolucao(CONDICAO_ITEM.OK);
                                    setObservacaoDevolucao('');
                                  }}
                                >
                                  <i className="bi bi-box-arrow-right"></i>
                                  <span>Check-out</span>
                                </button>
                              )}

                              {(visual.key === 'CONCLUIDO' || visual.key === 'RECUSADA' || visual.key === 'CANCELADA') && (
                                <button
                                  type="button"
                                  className="sol-action-btn sol-action-btn--ghost"
                                  title="Ver histórico"
                                  onClick={() => setSelectedReserva(res)}
                                >
                                  <i className="bi bi-clock-history"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Rodapé com paginação */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 pt-3 mt-2 border-top">
              <span className="text-muted small">
                Mostrando {paginated.length} de {filtered.length} solicitaç{filtered.length === 1 ? 'ão' : 'ões'}
              </span>
              {totalPages > 1 && (
                <div className="d-flex align-items-center gap-1">
                  <button
                    type="button"
                    className="sol-action-btn sol-action-btn--ghost"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Página anterior"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`sol-filter-pill ${n === currentPage ? 'sol-filter-pill--active' : ''}`}
                      style={{ minWidth: '38px', padding: '0.45rem 0', textAlign: 'center' }}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="sol-action-btn sol-action-btn--ghost"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Próxima página"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de Aprovação com Observação Opcional */}
      <ConfirmModal
        show={!!reservaToApprove}
        title="Aprovar Agendamento de Espaço"
        message={`Confirma a aprovação da reserva #${reservaToApprove?.id} para ${reservaToApprove?.itemNome}, solicitado por ${reservaToApprove?.usuarioNome}?`}
        confirmText="Confirmar Aprovação"
        confirmVariant="primary"
        cancelText="Voltar"
        onConfirm={handleConfirmApprove}
        onCancel={() => {
          setReservaToApprove(null);
          setApproveNote('');
        }}
        loading={actionLoading}
      >
        <Form.Group className="mt-3">
          <Form.Label className="config-label mb-1">Orientações ao Solicitante (opcional):</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
            placeholder="Ex: Chaves retiradas na portaria com documento funcional."
          />
        </Form.Group>
      </ConfirmModal>

      {/* Modal de Recusa com Justificativa Obrigatória */}
      <ConfirmModal
        show={!!reservaToReject}
        title="Recusar Solicitação de Reserva"
        message={`Informe a justificativa da recusa para a solicitação #${reservaToReject?.id}:`}
        confirmText="Confirmar Recusa"
        confirmVariant="danger"
        cancelText="Voltar"
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setReservaToReject(null);
          setRejectReason('');
        }}
        loading={actionLoading}
      >
        <Form.Group className="mt-2">
          <Form.Label className="config-label text-danger mb-1">Motivo da Não-Aprovação *</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Ex: Instalação reservada para manutenção preventiva programada."
            required
          />
        </Form.Group>
      </ConfirmModal>

      {/* Modal de Check-in (início de uso) */}
      <ConfirmModal
        show={!!reservaParaCheckin}
        title="Registrar Check-in"
        message={`Confirma o check-in de "${reservaParaCheckin?.itemNome}" para ${reservaParaCheckin?.usuarioNome}?`}
        confirmText="Confirmar Check-in"
        confirmVariant="primary"
        cancelText="Voltar"
        onConfirm={handleConfirmCheckin}
        onCancel={() => setReservaParaCheckin(null)}
        loading={actionLoading}
      />

      {/* Modal de Check-out (fim de uso) */}
      <ConfirmModal
        show={!!reservaParaCheckout}
        title="Registrar Check-out"
        message={`Confirme o check-out de "${reservaParaCheckout?.itemNome}" de ${reservaParaCheckout?.usuarioNome}:`}
        confirmText="Confirmar Check-out"
        confirmVariant="primary"
        cancelText="Voltar"
        onConfirm={handleConfirmCheckout}
        onCancel={() => {
          setReservaParaCheckout(null);
          setCondicaoDevolucao(CONDICAO_ITEM.OK);
          setObservacaoDevolucao('');
        }}
        loading={actionLoading}
      >
        <Form.Group className="mt-3">
          <Form.Label className="config-label mb-1">Condição do Item</Form.Label>
          <Form.Select value={condicaoDevolucao} onChange={(e) => setCondicaoDevolucao(e.target.value)}>
            <option value={CONDICAO_ITEM.OK}>{CONDICAO_ITEM_LABELS[CONDICAO_ITEM.OK]}</option>
            <option value={CONDICAO_ITEM.DANIFICADO}>{CONDICAO_ITEM_LABELS[CONDICAO_ITEM.DANIFICADO]}</option>
          </Form.Select>
        </Form.Group>
        {condicaoDevolucao === CONDICAO_ITEM.DANIFICADO && (
          <Form.Group className="mt-3">
            <Form.Label className="config-label text-danger mb-1">Descreva a Avaria *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={observacaoDevolucao}
              onChange={(e) => setObservacaoDevolucao(e.target.value)}
              placeholder="Ex: Tela trincada, cabo de alimentação faltando."
            />
          </Form.Group>
        )}
      </ConfirmModal>

      {/* Modal de Detalhes */}
      <DetailModal
        show={!!selectedReserva}
        onClose={() => setSelectedReserva(null)}
        data={selectedReserva}
        type="reserva"
      />
    </div>
  );
}

export default AprovaReservas;
