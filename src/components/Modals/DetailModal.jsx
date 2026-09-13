import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { STATUS_RESERVA_META, TIPO_ITEM_LABELS, CONDICAO_ITEM, CONDICAO_ITEM_LABELS } from '../../utils/constants';
import { formatDateBR, formatDateTimeBR } from '../../utils/formatDate';

export function DetailModal({ show, onClose, title = 'Detalhes', data, type = 'reserva' }) {
  if (!data) return null;

  return (
    <Modal show={show} onHide={onClose} centered size="lg" className="mockup-modal">
      <Modal.Header closeButton className="border-0 pb-2 pt-4 px-4">
        <Modal.Title className="fs-5 mockup-heading d-flex align-items-center gap-2">
          <span className="icon-box-blue" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>
            <i className={type === 'reserva' ? 'bi bi-calendar-event' : 'bi bi-box-seam'}></i>
          </span>
          <span>{title}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 pt-2">
        {type === 'reserva' && (
          <div className="d-flex flex-column gap-3">
            <div
              className="d-flex justify-content-between align-items-center p-3 rounded-4"
              style={{ backgroundColor: 'var(--surface-container-low)' }}
            >
              <div>
                <span className="config-label text-muted d-block">Identificador Único</span>
                <span className="font-monospace fw-bold fs-6">{data.id}</span>
              </div>
              <div>
                {STATUS_RESERVA_META[data.status] && (
                  <span className={STATUS_RESERVA_META[data.status].chipClass}>
                    <i className={`bi ${STATUS_RESERVA_META[data.status].icon}`}></i>
                    <span>{STATUS_RESERVA_META[data.status].label}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block mb-1">Espaço / Recurso</span>
                  <div className="fw-bold text-dark">{data.itemNome || 'Instalação'}</div>
                  {data.itemTipo && (
                    <span className="config-label text-secondary mt-1 d-inline-block">
                      {TIPO_ITEM_LABELS[data.itemTipo] || data.itemTipo}
                    </span>
                  )}
                  {data.prioridadeDocente && (
                    <span
                      className="nr-priority-tag d-inline-flex mt-2"
                      title="Solicitação de professor com prioridade sobre pedidos de alunos ainda pendentes (RN02)."
                    >
                      <i className="bi bi-award-fill"></i> Prioridade docente
                    </span>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block mb-1">Solicitante Responsável</span>
                  <div className="fw-bold text-dark">{data.usuarioNome || 'Usuário'}</div>
                  <span className="config-label text-primary mt-1 d-inline-block">
                    {data.usuarioRole || 'SOLICITANTE'}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block">Data do Agendamento</span>
                  <span className="fw-bold text-dark">{formatDateBR(data.data)}</span>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block">Turno</span>
                  <span className="fw-bold text-dark">{data.turno}</span>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block">Horário</span>
                  <span className="fw-bold text-dark">{data.horario}</span>
                </div>
              </div>

              <div className="col-12">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block mb-1">Finalidade / Justificativa</span>
                  <div className="text-secondary small" style={{ lineHeight: '1.5' }}>
                    {data.finalidade || 'Nenhuma justificativa detalhada informada.'}
                  </div>
                </div>
              </div>

              {data.quantidadePessoas && (
                <div className="col-12 col-md-6">
                  <span className="config-label text-muted d-block">Público Estimado</span>
                  <span className="fw-semibold text-dark">{data.quantidadePessoas} pessoas</span>
                </div>
              )}

              {data.createdAt && (
                <div className="col-12 col-md-6">
                  <span className="config-label text-muted d-block">Registrado em</span>
                  <span className="text-secondary small">{formatDateTimeBR(data.createdAt)}</span>
                </div>
              )}

              {data.retiradoEm && (
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                    <span className="config-label text-muted d-block">Retirado em</span>
                    <span className="fw-bold text-dark">{formatDateTimeBR(data.retiradoEm)}</span>
                  </div>
                </div>
              )}

              {data.devolvidoEm && (
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                    <span className="config-label text-muted d-block mb-1">Devolvido em</span>
                    <span className="fw-bold text-dark d-block mb-1">{formatDateTimeBR(data.devolvidoEm)}</span>
                    <span
                      className={`mockup-chip ${
                        data.condicaoDevolucao === CONDICAO_ITEM.DANIFICADO ? 'mockup-chip--error' : 'mockup-chip--success'
                      }`}
                    >
                      {CONDICAO_ITEM_LABELS[data.condicaoDevolucao] || data.condicaoDevolucao}
                    </span>
                    {data.observacaoDevolucao && (
                      <div className="text-secondary small mt-2">{data.observacaoDevolucao}</div>
                    )}
                  </div>
                </div>
              )}

              {data.observacaoAdmin && (
                <div className="col-12">
                  <div
                    className="p-3 rounded-4 mt-2"
                    style={{ backgroundColor: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)' }}
                  >
                    <span className="config-label d-block mb-1 text-primary">
                      Parecer Administrativo
                    </span>
                    <div className="small fw-medium">{data.observacaoAdmin}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {type === 'item' && (
          <div className="d-flex flex-column gap-3">
            <div
              className="d-flex justify-content-between align-items-center p-3 rounded-4"
              style={{ backgroundColor: 'var(--surface-container-low)' }}
            >
              <div>
                <span className="config-label text-muted d-block">Código do Catálogo</span>
                <span className="font-monospace fw-bold fs-6">#{data.id}</span>
              </div>
              <div>
                <span
                  className={`mockup-chip ${
                    data.status === 'ATIVO'
                      ? 'mockup-chip--success'
                      : data.status === 'MANUTENCAO'
                      ? 'mockup-chip--warning'
                      : 'mockup-chip--neutral'
                  }`}
                >
                  {data.status}
                </span>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block">Nome da Instalação / Recurso</span>
                  <h5 className="fw-bold text-dark mt-1 mb-0">{data.nome}</h5>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block">Categoria</span>
                  <span className="fw-semibold text-dark">{TIPO_ITEM_LABELS[data.tipo] || data.tipo}</span>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block">Capacidade</span>
                  <span className="fw-semibold text-dark">{data.capacidade} lugares / estações</span>
                </div>
              </div>

              <div className="col-12">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block">Localização Física</span>
                  <span className="fw-semibold text-dark">{data.localizacao}</span>
                </div>
              </div>

              <div className="col-12">
                <div className="p-3 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <span className="config-label text-muted d-block mb-1">Especificações & Recursos</span>
                  <div className="text-secondary small" style={{ lineHeight: '1.5' }}>
                    {data.descricao || 'Sem especificações cadastradas.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 pb-4 px-4">
        <button type="button" className="btn-mockup-outline" onClick={onClose}>
          Fechar Detalhes
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default DetailModal;
