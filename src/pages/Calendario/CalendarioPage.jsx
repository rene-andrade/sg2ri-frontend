import React, { useState, useEffect, useMemo } from 'react';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import DetailModal from '../../components/Modals/DetailModal';
import Loading from '../../components/Common/Loading';
import itemService from '../../services/itemService';
import reservaService from '../../services/reservaService';
import { TIPO_ITEM, STATUS_ITEM, STATUS_RESERVA, HORARIOS_PADRAO } from '../../utils/constants';
import { toISODate, getMonday, addDays } from '../../utils/formatDate';

const DIAS_SEMANA = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA'];
const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const TIPOS_ESPACO = [TIPO_ITEM.LABORATORIO, TIPO_ITEM.SALA, TIPO_ITEM.AUDITORIO];

export function CalendarioPage() {
  const [tipoRecurso, setTipoRecurso] = useState('Espaço');
  const [itens, setItens] = useState([]);
  const [itemId, setItemId] = useState('');
  const [loadingItens, setLoadingItens] = useState(true);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Recarrega os recursos ativos sempre que o Tipo de Recurso muda
  useEffect(() => {
    let cancelado = false;
    async function loadItens() {
      setLoadingItens(true);
      try {
        const list = await itemService.getItens();
        const filtrados = list.filter((item) => {
          if (item.status !== STATUS_ITEM.ATIVO) return false;
          return tipoRecurso === 'Espaço'
            ? TIPOS_ESPACO.includes(item.tipo)
            : item.tipo === TIPO_ITEM.EQUIPAMENTO;
        });
        if (cancelado) return;
        setItens(filtrados);
        setItemId((prev) =>
          prev && filtrados.some((i) => String(i.id) === String(prev)) ? prev : filtrados[0]?.id || ''
        );
      } finally {
        if (!cancelado) setLoadingItens(false);
      }
    }
    loadItens();
    return () => {
      cancelado = true;
    };
  }, [tipoRecurso]);

  const weekDays = useMemo(
    () =>
      DIAS_SEMANA.map((label, index) => {
        const date = addDays(weekStart, index);
        return {
          label,
          iso: toISODate(date),
          display: `${date.getDate()} ${MESES_ABREV[date.getMonth()]}`,
        };
      }),
    [weekStart]
  );

  const weekRangeLabel = useMemo(() => {
    const start = weekStart;
    const end = addDays(weekStart, 4);
    const startLabel =
      start.getMonth() === end.getMonth() ? `${start.getDate()}` : `${start.getDate()} ${MESES_ABREV[start.getMonth()]}`;
    return `${startLabel} - ${end.getDate()} ${MESES_ABREV[end.getMonth()]}, ${end.getFullYear()}`;
  }, [weekStart]);

  // Busca as reservas do recurso selecionado dentro da semana visível
  useEffect(() => {
    let cancelado = false;
    async function loadReservas() {
      if (!itemId) {
        setReservas([]);
        return;
      }
      setLoadingReservas(true);
      try {
        const isoInicio = weekDays[0].iso;
        const isoFim = weekDays[4].iso;
        const list = await reservaService.getReservas({ itemId });
        const doIntervalo = list.filter(
          (r) =>
            r.data >= isoInicio &&
            r.data <= isoFim &&
            (r.status === STATUS_RESERVA.APROVADA || r.status === STATUS_RESERVA.PENDENTE)
        );
        if (!cancelado) setReservas(doIntervalo);
      } finally {
        if (!cancelado) setLoadingReservas(false);
      }
    }
    loadReservas();
    return () => {
      cancelado = true;
    };
  }, [itemId, weekDays]);

  // Linhas de horário: slots padrão da instituição + qualquer horário real fora do padrão
  const timeRows = useMemo(() => {
    const base = HORARIOS_PADRAO.map((h) => h.split(' - ')[0]);
    const extras = reservas.map((r) => (r.horario || '').split(' - ')[0]).filter(Boolean);
    return Array.from(new Set([...base, ...extras])).sort();
  }, [reservas]);

  // Mapa "diaIndex-horaInicio" -> reserva, para posicionar cada card na célula certa
  const eventosPorCelula = useMemo(() => {
    const map = new Map();
    reservas.forEach((r) => {
      const horaInicio = (r.horario || '').split(' - ')[0];
      const dayIndex = weekDays.findIndex((d) => d.iso === r.data);
      if (dayIndex === -1 || !horaInicio) return;
      map.set(`${dayIndex}-${horaInicio}`, r);
    });
    return map;
  }, [reservas, weekDays]);

  const itemSelecionadoNome = itens.find((i) => String(i.id) === String(itemId))?.nome;

  return (
    <div className="d-flex flex-column gap-4 py-2">
      {/* Título e Subtítulo dos Mockups */}
      <div>
        <h1 className="mockup-heading fs-2 mb-1">Calendário de Disponibilidade</h1>
        <p className="text-secondary small mb-0">
          Gerencie e visualize a ocupação de ativos em tempo real.
        </p>
      </div>

      {/* Card de Filtros e Navegação Superior */}
      <div className="mockup-card p-4">
        <div className="row g-3 align-items-end">
          {/* Tipo de Recurso */}
          <div className="col-12 col-md-3">
            <label className="text-uppercase fw-bold text-muted small mb-2 d-block" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              TIPO DE RECURSO
            </label>
            <Form.Select
              value={tipoRecurso}
              onChange={(e) => setTipoRecurso(e.target.value)}
              className="py-2"
              style={{ backgroundColor: '#f8fafc !important', borderRadius: '0.625rem' }}
            >
              <option value="Espaço">Espaço</option>
              <option value="Equipamento">Equipamento</option>
            </Form.Select>
          </div>

          {/* Item Selecionado */}
          <div className="col-12 col-md-4">
            <label className="text-uppercase fw-bold text-muted small mb-2 d-block" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              ITEM SELECIONADO
            </label>
            <Form.Select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="py-2"
              disabled={loadingItens || itens.length === 0}
              style={{ backgroundColor: '#f8fafc !important', borderRadius: '0.625rem' }}
            >
              {itens.length === 0 ? (
                <option value="">Nenhum recurso ativo deste tipo</option>
              ) : (
                itens.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))
              )}
            </Form.Select>
          </div>

          {/* Navegação de Data e Legenda */}
          <div className="col-12 col-md-5 d-flex flex-column flex-sm-row align-items-sm-center justify-content-md-end gap-3 pt-2 pt-md-0">
            {/* Seletor Semanal */}
            <div className="d-flex align-items-center gap-2 p-1 px-2 rounded-pill border bg-white shadow-sm">
              <button
                type="button"
                className="btn btn-sm btn-light border-0 p-0 px-2 text-muted"
                onClick={() => setWeekStart((prev) => addDays(prev, -7))}
                aria-label="Semana anterior"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="small fw-bold text-dark d-flex align-items-center gap-2 px-1">
                <i className="bi bi-calendar3 text-primary"></i>
                <span>{weekRangeLabel}</span>
                {loadingReservas && <Spinner animation="border" size="sm" className="text-muted" />}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-light border-0 p-0 px-2 text-muted"
                onClick={() => setWeekStart((prev) => addDays(prev, 7))}
                aria-label="Próxima semana"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>

            {/* Legenda de Status */}
            <div className="d-flex align-items-center gap-3 small">
              <span className="text-secondary fw-semibold">Legenda de Status:</span>
              <div className="d-flex align-items-center gap-1">
                <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', backgroundColor: 'var(--sg-event-confirmed)' }}></span>
                <span className="text-dark small">Confirmado</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', backgroundColor: 'var(--sg-event-pending)' }}></span>
                <span className="text-dark small">Pendente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Semanal */}
      {loadingItens ? (
        <Loading message="Carregando recursos ativos..." />
      ) : itens.length === 0 ? (
        <div className="mockup-card p-5 text-center text-muted">
          <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
          Nenhum recurso ativo cadastrado para "{tipoRecurso}".
        </div>
      ) : (
        <div className="mockup-card overflow-hidden">
          <div className="table-responsive">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>
                    <i className="bi bi-clock fs-5 text-secondary"></i>
                  </th>
                  {weekDays.map((day) => (
                    <th key={day.iso}>
                      <div className="fw-bold">{day.label}</div>
                      <div className="small text-muted fw-normal">{day.display}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeRows.map((time) => (
                  <tr key={time}>
                    {/* Coluna do Horário */}
                    <td className="text-muted small text-center fw-medium pt-2" style={{ backgroundColor: '#fcfcfd' }}>
                      {time}
                    </td>

                    {/* 5 Colunas de Dias da Semana */}
                    {weekDays.map((day, dayIndex) => {
                      const reserva = eventosPorCelula.get(`${dayIndex}-${time}`);

                      if (reserva) {
                        const confirmado = reserva.status === STATUS_RESERVA.APROVADA;
                        return (
                          <td key={day.iso} className="p-2 position-relative">
                            <div
                              className={`${confirmado ? 'calendar-event-confirmed' : 'calendar-event-pending'} cursor-pointer transition-all`}
                              onClick={() => setSelectedEvent(reserva)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="fw-bold text-uppercase" style={{ fontSize: '0.65rem', opacity: 0.85, letterSpacing: '0.04em' }}>
                                {confirmado ? 'CONFIRMADO' : 'PENDENTE'}
                              </div>
                              <div className="calendar-event-title fw-bold text-white small my-1" style={{ lineHeight: '1.3' }}>
                                {reserva.finalidade || reserva.itemNome}
                              </div>
                              {reserva.usuarioNome && (
                                <div className="text-white-50" style={{ fontSize: '0.72rem', marginTop: '0.5rem' }}>
                                  {reserva.usuarioNome}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      }

                      return <td key={day.iso}></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loadingReservas && reservas.length === 0 && (
            <div className="text-center text-muted small py-3 border-top">
              Nenhuma reserva confirmada ou pendente para {itemSelecionadoNome || 'este recurso'} nesta semana.
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalhes da Reserva Clicada */}
      <DetailModal
        show={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        data={selectedEvent}
        type="reserva"
      />
    </div>
  );
}

export default CalendarioPage;
