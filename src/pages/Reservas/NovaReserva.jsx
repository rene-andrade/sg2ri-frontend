import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import { useAuth } from '../../hooks/useAuth';
import itemService from '../../services/itemService';
import reservaService from '../../services/reservaService';
import Stepper from '../../components/Common/Stepper';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import {
  TIPO_ITEM,
  TIPO_ITEM_LABELS,
  TIPO_ITEM_ICONS,
  STATUS_ITEM,
  STATUS_RESERVA,
  USER_ROLES,
  USER_ROLE_LABELS,
} from '../../utils/constants';
import { getTodayISO, formatDateBR } from '../../utils/formatDate';

const STEPS = ['Selecionar Recurso', 'Detalhes da Reserva', 'Confirmação'];

function timeToMinutes(hhmm) {
  if (!hhmm || !hhmm.includes(':')) return NaN;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function deriveTurno(horaInicio) {
  if (!horaInicio) return 'MANHA';
  if (horaInicio < '12:00') return 'MANHA';
  if (horaInicio < '18:00') return 'TARDE';
  return 'NOITE';
}

export function NovaReserva() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => ({
    tipo: location.state?.tipoPreferido || '',
    itemId: '',
    itemNome: '',
    itemLocalizacao: '',
    itemCapacidade: '',
    itemDescricao: '',
    data: getTodayISO(),
    horaInicio: '',
    horaFim: '',
    finalidade: '',
    aceitouTermos: false,
  }));

  const [itens, setItens] = useState([]);
  const [loadingItens, setLoadingItens] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stepError, setStepError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [availability, setAvailability] = useState({ status: 'idle' });

  useEffect(() => {
    async function loadItens() {
      setLoadingItens(true);
      try {
        const list = await itemService.getItens();
        setItens(list.filter((i) => i.status === STATUS_ITEM.ATIVO));
      } catch {
        setStepError('Não foi possível carregar os recursos disponíveis.');
      } finally {
        setLoadingItens(false);
      }
    }
    loadItens();
  }, []);

  useEffect(() => {
    async function checkAvailability() {
      if (!formData.itemId || !formData.data || !formData.horaInicio || !formData.horaFim) {
        setAvailability({ status: 'idle' });
        return;
      }
      setAvailability({ status: 'checking' });
      try {
        const reservas = await reservaService.getReservas({ itemId: formData.itemId, data: formData.data });
        const inicioMin = timeToMinutes(formData.horaInicio);
        const fimMin = timeToMinutes(formData.horaFim);
        const conflitos = reservas.filter((r) => {
          if (r.status === STATUS_RESERVA.CANCELADA || r.status === STATUS_RESERVA.RECUSADA) return false;
          const [rInicio, rFim] = (r.horario || '').split(' - ').map((s) => s.trim());
          const rInicioMin = timeToMinutes(rInicio);
          const rFimMin = timeToMinutes(rFim);
          if (isNaN(rInicioMin) || isNaN(rFimMin)) return false;
          return inicioMin < rFimMin && fimMin > rInicioMin;
        });

        if (conflitos.length === 0) {
          setAvailability({ status: 'available' });
          return;
        }

        // RN02: professores têm prioridade sobre alunos em recursos audiovisuais.
        // O pedido do professor segue disponível se todos os conflitos forem
        // solicitações de alunos ainda pendentes (uma reserva já aprovada não é reaberta).
        const prioridadeDocente =
          formData.tipo === TIPO_ITEM.EQUIPAMENTO &&
          user?.role === USER_ROLES.PROFESSOR &&
          conflitos.every((r) => r.status === STATUS_RESERVA.PENDENTE && r.usuarioRole === USER_ROLES.ALUNO);

        setAvailability(prioridadeDocente ? { status: 'priority' } : { status: 'unavailable' });
      } catch {
        setAvailability({ status: 'idle' });
      }
    }
    checkAvailability();
  }, [formData.itemId, formData.data, formData.horaInicio, formData.horaFim, formData.tipo, user?.role]);

  const filteredItens = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return itens.filter((item) => {
      const matchTipo = !formData.tipo || item.tipo === formData.tipo;
      const matchSearch =
        !term ||
        item.nome.toLowerCase().includes(term) ||
        item.localizacao.toLowerCase().includes(term);
      return matchTipo && matchSearch;
    });
  }, [itens, formData.tipo, searchTerm]);

  const itensDoTipo = useMemo(
    () => itens.filter((item) => !formData.tipo || item.tipo === formData.tipo),
    [itens, formData.tipo]
  );

  const handleSelectItem = (item) => {
    setFormData((prev) => ({
      ...prev,
      tipo: item.tipo,
      itemId: item.id,
      itemNome: item.nome,
      itemLocalizacao: item.localizacao,
      itemCapacidade: item.capacidade,
      itemDescricao: item.descricao,
    }));
    setStepError('');
  };

  const handleTipoChange = (e) => {
    const tipo = e.target.value;
    setFormData((prev) => ({
      ...prev,
      tipo,
      itemId: '',
      itemNome: '',
      itemLocalizacao: '',
      itemCapacidade: '',
      itemDescricao: '',
    }));
  };

  const handleNomeChange = (e) => {
    const item = itens.find((i) => String(i.id) === String(e.target.value));
    if (item) handleSelectItem(item);
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateStep1 = () => {
    if (!formData.itemId) {
      setStepError('Selecione um recurso para continuar.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.tipo || !formData.itemId) {
      setStepError('Selecione o tipo e o recurso desejado.');
      return false;
    }
    if (!formData.data) {
      setStepError('Informe a data da reserva.');
      return false;
    }
    if (!formData.horaInicio || !formData.horaFim) {
      setStepError('Informe o horário de início e de fim.');
      return false;
    }
    if (timeToMinutes(formData.horaFim) <= timeToMinutes(formData.horaInicio)) {
      setStepError('O horário de fim deve ser posterior ao horário de início.');
      return false;
    }
    if (!formData.finalidade.trim()) {
      setStepError('Descreva a finalidade do uso.');
      return false;
    }
    if (!formData.aceitouTermos) {
      setStepError('É necessário aceitar os Termos de Responsabilidade para continuar.');
      return false;
    }
    if (formData.tipo === TIPO_ITEM.EQUIPAMENTO) {
      const inicioDateTime = new Date(`${formData.data}T${formData.horaInicio}:00`);
      const diffHoras = (inicioDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
      if (diffHoras < 24) {
        setStepError('Reservas de equipamentos eletrônicos exigem no mínimo 24 horas de antecedência.');
        return false;
      }
    }
    // RN01: alunos só podem reservar salas de estudo por no máximo 2 horas consecutivas.
    if (formData.tipo === TIPO_ITEM.SALA && user?.role === USER_ROLES.ALUNO) {
      const duracaoHoras = (timeToMinutes(formData.horaFim) - timeToMinutes(formData.horaInicio)) / 60;
      if (duracaoHoras > 2) {
        setStepError('Alunos podem reservar salas de estudo por no máximo 2 horas consecutivas.');
        return false;
      }
    }
    if (availability.status === 'unavailable') {
      setStepError('O recurso não está disponível no horário selecionado. Ajuste a data ou o horário.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setStepError('');
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStepError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCancelClick = () => {
    if (formData.itemId || formData.finalidade.trim()) {
      setShowCancelConfirm(true);
    } else {
      navigate('/minhas-reservas');
    }
  };

  const handleConfirmReserva = async () => {
    setSubmitting(true);
    setStepError('');
    try {
      await reservaService.createReserva({
        itemId: formData.itemId,
        itemNome: formData.itemNome,
        itemTipo: formData.tipo,
        data: formData.data,
        turno: deriveTurno(formData.horaInicio),
        horario: `${formData.horaInicio} - ${formData.horaFim}`,
        finalidade: formData.finalidade.trim(),
        usuarioId: user?.id,
        usuarioNome: user?.name,
        usuarioRole: user?.role,
        prioridadeDocente: availability.status === 'priority',
      });
      navigate('/minhas-reservas', {
        state: { successMessage: 'Solicitação registrada com sucesso! Aguarde o parecer da administração.' },
      });
    } catch (err) {
      setStepError(err.message || 'Falha ao registrar a solicitação de reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  const tipText =
    currentStep === 1
      ? 'Selecione o tipo de recurso e escolha entre os itens ativos disponíveis para reserva.'
      : currentStep === 2
      ? formData.tipo === TIPO_ITEM.EQUIPAMENTO
        ? user?.role === USER_ROLES.PROFESSOR
          ? 'Reservas de equipamentos eletrônicos exigem 24h de antecedência. Como docente, sua solicitação tem prioridade sobre pedidos de alunos ainda pendentes para o mesmo equipamento.'
          : 'Reservas de equipamentos eletrônicos devem ser feitas com no mínimo 24 horas de antecedência. Solicitações de professores têm prioridade sobre as de alunos.'
        : formData.tipo === TIPO_ITEM.SALA && user?.role === USER_ROLES.ALUNO
        ? 'Alunos podem reservar salas de estudo por no máximo 2 horas consecutivas.'
        : 'Verifique a disponibilidade do espaço antes de confirmar sua solicitação.'
      : 'Revise atentamente os dados antes de confirmar. Após o envio, sua solicitação seguirá para aprovação administrativa.';

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 gap-lg-4">
        <div>
          <h1 className="mockup-heading fs-2 mb-1">Solicitar Nova Reserva</h1>
          <p className="text-secondary mb-0" style={{ maxWidth: '560px' }}>
            Preencha as informações detalhadas abaixo para solicitar o uso de espaços físicos ou equipamentos
            tecnológicos da unidade.
          </p>
        </div>

        <div className="nr-tip-box">
          <div className="nr-tip-icon">
            <i className="bi bi-info-lg"></i>
          </div>
          <div>
            <div className="nr-tip-title">Dica de Agendamento</div>
            <p className="nr-tip-text">{tipText}</p>
          </div>
        </div>
      </div>

      <div className="mockup-card p-4 p-md-5">
        <div className="mb-4 mb-md-5 px-md-4">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {stepError && (
          <Alert variant="danger" className="rounded-3 border-0 small">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {stepError}
          </Alert>
        )}

        {currentStep === 1 && (
          <div className="d-flex flex-column gap-4">
            <Row className="g-3">
              <Col xs={12} md={5}>
                <Form.Select
                  value={formData.tipo}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, tipo: e.target.value }));
                    setStepError('');
                  }}
                  className="config-select"
                >
                  <option value="">Todos os Tipos de Recurso</option>
                  {Object.values(TIPO_ITEM).map((t) => (
                    <option key={t} value={t}>
                      {TIPO_ITEM_LABELS[t]}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={7}>
                <div className="gu-toolbar__search">
                  <i className="bi bi-search gu-toolbar__search-icon"></i>
                  <Form.Control
                    type="text"
                    className="gu-search-input"
                    placeholder="Buscar por nome ou localização..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Col>
            </Row>

            {loadingItens ? (
              <div className="d-flex align-items-center gap-2 text-muted py-4 justify-content-center">
                <Spinner animation="border" size="sm" />
                <span>Carregando recursos...</span>
              </div>
            ) : filteredItens.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                Nenhum recurso encontrado para os filtros selecionados.
              </div>
            ) : (
              <Row className="g-3">
                {filteredItens.map((item) => {
                  const selected = String(formData.itemId) === String(item.id);
                  return (
                    <Col xs={12} sm={6} lg={4} key={item.id}>
                      <div
                        className={`nr-resource-card position-relative ${
                          selected ? 'nr-resource-card--selected' : ''
                        }`}
                        onClick={() => handleSelectItem(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleSelectItem(item);
                        }}
                      >
                        {selected && <i className="bi bi-check-circle-fill nr-resource-card__check"></i>}
                        <div className="nr-resource-card__icon">
                          <i className={`bi ${TIPO_ITEM_ICONS[item.tipo] || 'bi-box-seam'}`}></i>
                        </div>
                        {item.tipo === TIPO_ITEM.EQUIPAMENTO && (
                          <span className="nr-priority-tag d-inline-flex mb-2">
                            <i className="bi bi-award-fill"></i> Prioridade docente
                          </span>
                        )}
                        <div className="fw-bold text-dark mb-1">{item.nome}</div>
                        <div className="text-secondary small mb-1">
                          <i className="bi bi-geo-alt me-1"></i>
                          {item.localizacao}
                        </div>
                        <div className="text-secondary small">
                          <i className="bi bi-people me-1"></i>
                          Capacidade: {item.capacidade}
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <Row className="g-4">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="config-label mb-2 d-block">Tipo de Recurso</Form.Label>
                <Form.Select value={formData.tipo} onChange={handleTipoChange} className="config-select">
                  <option value="">Selecione o tipo</option>
                  {Object.values(TIPO_ITEM).map((t) => (
                    <option key={t} value={t}>
                      {TIPO_ITEM_LABELS[t]}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="config-label mb-2 d-block">Nome do Recurso</Form.Label>
                <Form.Select value={formData.itemId} onChange={handleNomeChange} disabled={!formData.tipo}>
                  <option value="">{formData.tipo ? 'Selecione o recurso' : 'Escolha o tipo primeiro'}</option>
                  {itensDoTipo.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="config-label mb-2 d-block">Data da Reserva</Form.Label>
                <Form.Control
                  type="date"
                  name="data"
                  min={getTodayISO()}
                  value={formData.data}
                  onChange={handleFieldChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="config-label mb-2 d-block">Horário de Início</Form.Label>
                <Form.Control
                  type="time"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleFieldChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="config-label mb-2 d-block">Horário de Fim</Form.Label>
                <Form.Control type="time" name="horaFim" value={formData.horaFim} onChange={handleFieldChange} />
              </Form.Group>
            </Col>

            <Col xs={12} className="d-flex justify-content-end">
              {availability.status === 'checking' && (
                <span className="nr-badge-checking">
                  <Spinner size="sm" animation="border" /> Verificando...
                </span>
              )}
              {availability.status === 'available' && (
                <span className="nr-badge-available">
                  <i className="bi bi-check-circle-fill"></i> Disponível
                </span>
              )}
              {availability.status === 'priority' && (
                <span
                  className="nr-badge-priority"
                  title="Solicitações de professores têm prioridade sobre pedidos de alunos ainda pendentes para o mesmo equipamento (RN02)."
                >
                  <i className="bi bi-award-fill"></i> Disponível com prioridade docente
                </span>
              )}
              {availability.status === 'unavailable' && (
                <span className="nr-badge-unavailable">
                  <i className="bi bi-x-circle-fill"></i> Indisponível
                </span>
              )}
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label className="config-label mb-2 d-block">Finalidade do Uso</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="finalidade"
                  placeholder="Descreva brevemente para que o recurso será utilizado..."
                  value={formData.finalidade}
                  onChange={handleFieldChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <div className="nr-terms-box">
                <input
                  type="checkbox"
                  id="aceitouTermos"
                  name="aceitouTermos"
                  checked={formData.aceitouTermos}
                  onChange={handleFieldChange}
                  className="form-check-input mt-1 flex-shrink-0"
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="aceitouTermos" className="mb-0" style={{ cursor: 'pointer' }}>
                  Eu declaro estar ciente dos{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                  >
                    Termos de Responsabilidade
                  </a>{' '}
                  quanto ao uso correto e conservação do recurso solicitado, comprometendo-me a devolvê-lo nas
                  mesmas condições de recebimento.
                </label>
              </div>
            </Col>
          </Row>
        )}

        {currentStep === 3 && (
          <div className="d-flex flex-column gap-3">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <div className="nr-summary-tile">
                  <span className="nr-summary-label">Recurso</span>
                  <div className="fw-bold text-dark">{formData.itemNome}</div>
                  <div className="text-secondary small">
                    {TIPO_ITEM_LABELS[formData.tipo]} · {formData.itemLocalizacao}
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className="nr-summary-tile">
                  <span className="nr-summary-label">Solicitante</span>
                  <div className="fw-bold text-dark">{user?.name}</div>
                  <div className="text-secondary small">{USER_ROLE_LABELS[user?.role] || user?.role}</div>
                </div>
              </Col>
              <Col xs={12} md={4}>
                <div className="nr-summary-tile">
                  <span className="nr-summary-label">Data</span>
                  <div className="fw-bold text-dark">{formatDateBR(formData.data)}</div>
                </div>
              </Col>
              <Col xs={12} md={4}>
                <div className="nr-summary-tile">
                  <span className="nr-summary-label">Horário</span>
                  <div className="fw-bold text-dark">
                    {formData.horaInicio} - {formData.horaFim}
                  </div>
                </div>
              </Col>
              <Col xs={12} md={4}>
                <div className="nr-summary-tile">
                  <span className="nr-summary-label">Disponibilidade</span>
                  <div className="fw-bold text-dark">
                    {availability.status === 'unavailable'
                      ? 'Indisponível'
                      : availability.status === 'priority'
                      ? 'Disponível (prioridade docente)'
                      : 'Disponível'}
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="nr-summary-tile">
                  <span className="nr-summary-label">Finalidade do Uso</span>
                  <div className="text-secondary" style={{ lineHeight: 1.5 }}>
                    {formData.finalidade}
                  </div>
                </div>
              </Col>
            </Row>

            <Alert variant="light" className="rounded-3 border small text-secondary mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Sua solicitação será enviada para aprovação da administração. Você pode acompanhar o status em
              "Minhas Reservas".
            </Alert>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center pt-4 mt-4 border-top">
          <button
            type="button"
            className="btn btn-link text-danger text-decoration-none fw-semibold p-0"
            onClick={handleCancelClick}
          >
            <i className="bi bi-x-lg me-1"></i>
            Cancelar
          </button>

          <div className="d-flex align-items-center gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-link text-secondary text-decoration-none fw-semibold"
                onClick={handleBack}
              >
                Voltar
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="btn-mockup-primary"
                onClick={handleNext}
                disabled={currentStep === 1 && !formData.itemId}
              >
                <span>Próximo</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            ) : (
              <button
                type="button"
                className="btn-mockup-primary"
                onClick={handleConfirmReserva}
                disabled={submitting}
              >
                {submitting && <Spinner size="sm" animation="border" className="me-2" />}
                <span>Confirmar Reserva</span>
                <i className="bi bi-check-lg"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        show={showCancelConfirm}
        title="Cancelar Solicitação"
        message="Deseja realmente cancelar? As informações preenchidas serão perdidas."
        confirmText="Sim, cancelar"
        confirmVariant="danger"
        cancelText="Continuar preenchendo"
        onConfirm={() => navigate('/minhas-reservas')}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <Modal show={showTermsModal} onHide={() => setShowTermsModal(false)} centered>
        <Modal.Header closeButton className="border-0 pt-4 px-4 pb-0">
          <Modal.Title className="mockup-heading fs-5">Termos de Responsabilidade</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4 pt-2 small text-secondary" style={{ lineHeight: 1.6 }}>
          <p>Ao utilizar o espaço ou equipamento reservado, o(a) solicitante se compromete a:</p>
          <ul>
            <li>Zelar pela conservação e integridade do recurso durante todo o período de uso;</li>
            <li>Comunicar imediatamente à administração qualquer dano, defeito ou mau funcionamento identificado;</li>
            <li>Devolver o recurso nas mesmas condições em que foi recebido, incluindo acessórios e cabos;</li>
            <li>Respeitar o horário reservado, liberando o espaço ou equipamento pontualmente ao término da atividade.</li>
          </ul>
          <p className="mb-0">
            O descumprimento destas condições poderá acarretar restrições para futuras solicitações de reserva.
          </p>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default NovaReserva;
