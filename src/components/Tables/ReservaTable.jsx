import React, { useState, useMemo } from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { STATUS_RESERVA, STATUS_RESERVA_META, CONDICAO_ITEM, CONDICAO_ITEM_LABELS } from '../../utils/constants';
import { formatDateBR, formatDateTimeBR } from '../../utils/formatDate';

export function ReservaTable({
  reservas = [],
  onViewDetails,
  onCancelReserva,
  emptyMessage = 'Nenhuma solicitação encontrada.',
}) {
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReservas = useMemo(() => {
    return reservas.filter((res) => {
      const matchStatus = filterStatus === 'TODOS' || res.status === filterStatus;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        res.itemNome?.toLowerCase().includes(term) ||
        res.usuarioNome?.toLowerCase().includes(term) ||
        res.finalidade?.toLowerCase().includes(term) ||
        res.id?.toLowerCase().includes(term);

      return matchStatus && matchSearch;
    });
  }, [reservas, filterStatus, searchTerm]);

  return (
    <div className="d-flex flex-column gap-4">
      {/* Barra de Filtros Inset */}
      <div
        className="p-3 rounded-4"
        style={{
          backgroundColor: 'var(--surface-container-low)',
        }}
      >
        <Row className="g-3 align-items-center">
          <Col xs={12} md={7}>
            <div className="position-relative">
              <i
                className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                style={{ fontSize: '0.85rem' }}
              ></i>
              <Form.Control
                type="text"
                placeholder="Filtrar por instalação, ID ou justificativa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-5 py-2 bg-white"
                style={{
                  backgroundColor: '#ffffff !important',
                  borderRadius: '0.75rem',
                }}
              />
            </div>
          </Col>

          <Col xs={12} md={5} className="d-flex justify-content-md-end gap-2">
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-2"
              style={{
                backgroundColor: '#ffffff !important',
                borderRadius: '0.75rem',
                maxWidth: '240px',
              }}
            >
              <option value="TODOS">Todos os Status</option>
              <option value={STATUS_RESERVA.PENDENTE}>Pendentes</option>
              <option value={STATUS_RESERVA.APROVADA}>Aprovadas</option>
              <option value={STATUS_RESERVA.RECUSADA}>Recusadas</option>
              <option value={STATUS_RESERVA.CANCELADA}>Canceladas</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Tabela de Dados */}
      <div className="mockup-card overflow-hidden">
        <div className="table-responsive">
          <Table hover className="gu-table align-middle mb-0 text-nowrap">
            <thead>
              <tr>
                <th className="ps-4">Código</th>
                <th>Instalação / Espaço</th>
                <th>Data</th>
                <th>Horário & Turno</th>
                <th>Status</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    <div className="icon-box-blue mb-3 mx-auto" style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>
                      <i className="bi bi-inbox"></i>
                    </div>
                    <div className="fw-semibold text-dark">{emptyMessage}</div>
                    <small className="text-muted">Nenhum registro corresponde aos filtros selecionados.</small>
                  </td>
                </tr>
              ) : (
                filteredReservas.map((res) => {
                  const meta = STATUS_RESERVA_META[res.status] || {
                    label: res.status,
                    chipClass: 'mockup-chip mockup-chip--neutral',
                    icon: 'bi-dot',
                  };

                  return (
                    <tr key={res.id} className="gu-table__row">
                      <td className="ps-4 font-monospace small fw-bold text-muted">
                        {res.id}
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{res.itemNome}</div>
                        <span className="config-label text-muted" style={{ fontSize: '0.65rem' }}>
                          {res.itemTipo}
                        </span>
                        {res.prioridadeDocente && (
                          <span
                            className="nr-priority-tag d-inline-flex mt-1"
                            title="Solicitação de professor com prioridade sobre pedidos de alunos ainda pendentes (RN02)."
                          >
                            <i className="bi bi-award-fill"></i> Prioridade docente
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="fw-semibold">{formatDateBR(res.data)}</span>
                      </td>
                      <td>
                        <div className="small fw-semibold text-dark">{res.horario}</div>
                        <div className="config-label text-muted" style={{ fontSize: '0.65rem' }}>
                          Turno {res.turno}
                        </div>
                      </td>
                      <td>
                        <span className={meta.chipClass}>
                          <i className={`bi ${meta.icon}`}></i>
                          <span>{meta.label}</span>
                        </span>
                        {res.status === STATUS_RESERVA.APROVADA && (
                          <div className="small mt-1" style={{ fontSize: '0.72rem' }}>
                            {res.devolvidoEm ? (
                              <span className={res.condicaoDevolucao === CONDICAO_ITEM.DANIFICADO ? 'text-danger' : 'text-success'}>
                                <i className="bi bi-box-arrow-right me-1"></i>
                                Check-out feito — {CONDICAO_ITEM_LABELS[res.condicaoDevolucao] || res.condicaoDevolucao}
                              </span>
                            ) : res.retiradoEm ? (
                              <span className="text-primary">
                                <i className="bi bi-box-arrow-in-right me-1"></i>
                                Em uso desde {formatDateTimeBR(res.retiradoEm)}
                              </span>
                            ) : (
                              <span className="text-muted">
                                <i className="bi bi-hourglass me-1"></i>
                                Aguardando check-in
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex align-items-center gap-2">
                          {onViewDetails && (
                            <button
                              type="button"
                              className="btn btn-sm btn-mockup-outline p-0 d-inline-flex align-items-center justify-content-center"
                              onClick={() => onViewDetails(res)}
                              title="Visualizar detalhes"
                              style={{ width: '34px', height: '34px', minHeight: '34px', borderRadius: '50rem' }}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          )}

                          {res.status === STATUS_RESERVA.PENDENTE && onCancelReserva && (
                            <button
                              type="button"
                              className="btn-mockup-outline text-danger border-0 py-1 px-3"
                              onClick={() => onCancelReserva(res)}
                              title="Cancelar Reserva"
                              style={{ minHeight: '34px', backgroundColor: 'var(--error-container)' }}
                            >
                              <i className="bi bi-slash-circle me-1"></i>
                              <span>Cancelar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default ReservaTable;
