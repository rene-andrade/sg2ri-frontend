import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Table from 'react-bootstrap/Table';
import reservaService from '../../services/reservaService';
import itemService from '../../services/itemService';
import Loading from '../../components/Common/Loading';
import { STATUS_ITEM, HORARIOS_PADRAO } from '../../utils/constants';
import { getMonday, addDays, toISODate, formatDateBR, formatDateTimeBR } from '../../utils/formatDate';

function calcularDuracaoHoras(horario) {
  const [inicio, fim] = (horario || '').split(' - ').map((s) => s.trim());
  if (!inicio || !fim) return 0;
  const [hi, mi] = inicio.split(':').map(Number);
  const [hf, mf] = fim.split(':').map(Number);
  if ([hi, mi, hf, mf].some((n) => isNaN(n))) return 0;
  return Math.max(0, (hf * 60 + mf - (hi * 60 + mi)) / 60);
}

// Conta dias úteis (segunda a sexta) dentro do período selecionado, para
// derivar a carga horária teórica de referência proporcional ao intervalo
// escolhido (em vez de assumir sempre 5 dias de uma semana fixa).
function contarDiasUteis(inicioISO, fimISO) {
  let cursor = new Date(`${inicioISO}T00:00:00`);
  const fim = new Date(`${fimISO}T00:00:00`);
  let count = 0;
  while (cursor <= fim) {
    const diaSemana = cursor.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState([]);
  const [itens, setItens] = useState([]);

  const semanaAtual = getMonday(new Date());
  const [dataInicio, setDataInicio] = useState(toISODate(semanaAtual));
  const [dataFim, setDataFim] = useState(toISODate(addDays(semanaAtual, 6)));

  function handleDataInicioChange(value) {
    setDataInicio(value);
    if (dataFim < value) setDataFim(value);
  }

  function handleDataFimChange(value) {
    if (value < dataInicio) return;
    setDataFim(value);
  }

  function selecionarEstaSemana() {
    const seg = getMonday(new Date());
    setDataInicio(toISODate(seg));
    setDataFim(toISODate(addDays(seg, 6)));
  }

  function selecionarEsteMes() {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    setDataInicio(toISODate(primeiroDia));
    setDataFim(toISODate(ultimoDia));
  }

  useEffect(() => {
    async function loadReportData() {
      try {
        const [resList, itemList] = await Promise.all([
          reservaService.getReservas(),
          itemService.getItens(),
        ]);
        setReservas(resList);
        setItens(itemList);
      } catch (err) {
        console.error('Erro ao carregar dados do relatório:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, []);

  if (loading) {
    return <Loading message="Calculando indicadores de ocupação e ociosidade..." />;
  }

  // Período selecionado pelo usuário no filtro — os indicadores abaixo só
  // consideram reservas com data dentro desse intervalo.
  const rotuloPeriodo = `${formatDateBR(dataInicio)} a ${formatDateBR(dataFim)}`;
  const reservasDoPeriodo = reservas.filter((r) => r.data >= dataInicio && r.data <= dataFim);

  // Recursos em manutenção/inativos não podem ser reservados — não devem contar
  // como "0% de ocupação" na média geral, senão a taxa fica artificialmente baixa.
  const itensAtivos = itens.filter((i) => i.status === STATUS_ITEM.ATIVO);
  const itensIndisponiveis = itens.length - itensAtivos.length;

  const totalReservasAprovadas = reservas.filter((r) => r.status === 'APROVADA').length;

  // Carga horária teórica derivada dos próprios horários padrão da instituição
  // (constants.HORARIOS_PADRAO) multiplicada pelos dias úteis do período escolhido,
  // em vez de um número fixo desconectado da grade real ou de uma semana fixa.
  const horasDiariasTeoricas = HORARIOS_PADRAO.reduce((acc, h) => acc + calcularDuracaoHoras(h), 0);
  const diasUteisPeriodo = Math.max(1, contarDiasUteis(dataInicio, dataFim));
  const totalHorasTeoricasPeriodo = Math.round(horasDiariasTeoricas * diasUteisPeriodo * 10) / 10;

  const turnosCount = {
    MANHA: reservasDoPeriodo.filter((r) => r.turno === 'MANHA' && r.status === 'APROVADA').length,
    TARDE: reservasDoPeriodo.filter((r) => r.turno === 'TARDE' && r.status === 'APROVADA').length,
    NOITE: reservasDoPeriodo.filter((r) => r.turno === 'NOITE' && r.status === 'APROVADA').length,
  };
  const totalPorTurno = turnosCount.MANHA + turnosCount.TARDE + turnosCount.NOITE || 1;

  const itemStats = itensAtivos.map((item) => {
    const itemReservas = reservasDoPeriodo.filter(
      (r) => String(r.itemId) === String(item.id) && r.status === 'APROVADA'
    );
    const horasReais = itemReservas.reduce((acc, r) => acc + calcularDuracaoHoras(r.horario), 0);
    const horasOcupadas = Math.round(horasReais * 10) / 10;
    const taxaOcupacao = Math.min(100, Math.round((horasOcupadas / totalHorasTeoricasPeriodo) * 100));
    const taxaOciosidade = 100 - taxaOcupacao;

    return {
      ...item,
      totalReservas: itemReservas.length,
      horasOcupadas,
      taxaOcupacao,
      taxaOciosidade,
    };
  });

  const mediaOcupacaoGeral =
    itemStats.length > 0
      ? Math.round(itemStats.reduce((acc, curr) => acc + curr.taxaOcupacao, 0) / itemStats.length)
      : 0;

  const mediaOciosidadeGeral = 100 - mediaOcupacaoGeral;

  return (
    <div className="d-flex flex-column gap-5 rel-report">
      {/* Cabeçalho exclusivo da versão impressa */}
      <div className="d-none d-print-block rel-print-header">
        <div className="d-flex justify-content-between align-items-end">
          <div>
            <div className="fw-bold" style={{ fontSize: '1.1rem' }}>SG2RI — Sistema de Gestão de Reserva de Recursos e Instalações</div>
            <div className="text-secondary small">Relatório de Ocupação &amp; Ociosidade — Período de {rotuloPeriodo}</div>
          </div>
          <div className="text-secondary small text-end">Gerado em {formatDateTimeBR(new Date())}</div>
        </div>
      </div>

      {/* Top Banner */}
      <div className="mockup-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 d-print-none">
        <div>
          <span className="config-label text-muted d-block">Inteligência Operacional (RF05)</span>
          <h2 className="fw-bold text-dark mockup-heading mb-1">Relatórios de Ocupação & Ociosidade</h2>
          <p className="text-secondary small mb-0">
            Acompanhamento estatístico do aproveitamento do patrimônio e instalações da instituição.
          </p>
        </div>

        <button
          type="button"
          className="btn-mockup-outline"
          onClick={() => window.print()}
        >
          <i className="bi bi-printer"></i>
          <span>Gerar Relatório Impresso</span>
        </button>
      </div>

      {/* Filtro de Período */}
      <div className="mockup-card p-4 d-print-none">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-3">
            <label className="text-uppercase fw-bold text-muted small mb-2 d-block" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              DE
            </label>
            <Form.Control
              type="date"
              value={dataInicio}
              onChange={(e) => handleDataInicioChange(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="text-uppercase fw-bold text-muted small mb-2 d-block" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              ATÉ
            </label>
            <Form.Control
              type="date"
              value={dataFim}
              min={dataInicio}
              onChange={(e) => handleDataFimChange(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-6 d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={selecionarEstaSemana}>
              Esta Semana
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={selecionarEsteMes}>
              Este Mês
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Destaque Editorial */}
      <Row className="g-4">
        <Col xs={12} sm={6} lg={4}>
          <div className="mockup-card p-4 h-100 d-flex flex-column justify-content-between">
            <span className="config-label text-muted">Taxa Geral de Ocupação</span>
            <div className="my-3">
              <div className="d-flex align-items-baseline gap-2">
                <h1 className="mockup-heading fw-bold text-dark mb-0">{mediaOcupacaoGeral}%</h1>
                <span className="small text-muted">da capacidade do período</span>
              </div>
              <div className="mt-3">
                <ProgressBar
                  now={mediaOcupacaoGeral}
                  className="rounded-pill"
                  style={{ height: '8px', backgroundColor: 'var(--surface-container)' }}
                />
              </div>
            </div>
            <span className="small text-muted">
              Média entre os {itemStats.length} recursos ativos, período de {rotuloPeriodo}.
            </span>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <div className="mockup-card p-4 h-100 d-flex flex-column justify-content-between">
            <span className="config-label text-muted">Taxa Média de Ociosidade</span>
            <div className="my-3">
              <div className="d-flex align-items-baseline gap-2">
                <h1 className="mockup-heading fw-bold text-dark mb-0">{mediaOciosidadeGeral}%</h1>
                <span className="small text-muted">janelas livres</span>
              </div>
              <div className="mt-3">
                <ProgressBar
                  now={mediaOciosidadeGeral}
                  className="rounded-pill"
                  style={{ height: '8px', backgroundColor: 'var(--surface-container)' }}
                />
              </div>
            </div>
            <span className="small text-muted">Potencial disponível para novos agendamentos neste período.</span>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <div className="mockup-card p-4 h-100 d-flex flex-column justify-content-between">
            <span className="config-label text-muted">Total de Reservas Aprovadas</span>
            <div className="my-3">
              <div className="d-flex align-items-baseline gap-2">
                <h1 className="mockup-heading fw-bold text-dark mb-0">{totalReservasAprovadas}</h1>
                <span className="small text-muted">acumulado histórico</span>
              </div>
              <div className="mt-3">
                <span className="mockup-chip mockup-chip--success">
                  <i className="bi bi-shield-check"></i>
                  <span>Base Consolidada</span>
                </span>
              </div>
            </div>
            <span className="small text-muted">
              {itensIndisponiveis > 0
                ? `${itensIndisponiveis} recurso(s) fora da média por manutenção/inatividade.`
                : 'Todos os recursos cadastrados estão ativos.'}
            </span>
          </div>
        </Col>
      </Row>

      {/* Distribuição por Turno com Tonal Layering */}
      <div className="mockup-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="config-label text-muted d-block">Distribuição da Demanda &middot; Período de {rotuloPeriodo}</span>
            <h4 className="fw-bold text-dark mockup-heading mb-0">Demanda de Ocupação por Turno</h4>
          </div>
        </div>

        <Row className="g-4">
          <Col xs={12} md={4}>
            <div className="p-4 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-dark">Manhã</span>
                <span className="config-label text-muted">07:30 - 12:00</span>
              </div>
              <div className="mockup-heading fs-3 fw-bold text-dark mb-2">
                {turnosCount.MANHA}{' '}
                <small className="fs-6 fw-normal text-muted">reservas</small>
              </div>
              <ProgressBar
                now={Math.round((turnosCount.MANHA / totalPorTurno) * 100)}
                className="rounded-pill mb-2"
                style={{ height: '6px' }}
              />
              <span className="config-label text-muted">
                {Math.round((turnosCount.MANHA / totalPorTurno) * 100)}% da demanda do período
              </span>
            </div>
          </Col>

          <Col xs={12} md={4}>
            <div className="p-4 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-dark">Tarde</span>
                <span className="config-label text-muted">13:30 - 18:00</span>
              </div>
              <div className="mockup-heading fs-3 fw-bold text-dark mb-2">
                {turnosCount.TARDE}{' '}
                <small className="fs-6 fw-normal text-muted">reservas</small>
              </div>
              <ProgressBar
                now={Math.round((turnosCount.TARDE / totalPorTurno) * 100)}
                className="rounded-pill mb-2"
                style={{ height: '6px' }}
              />
              <span className="config-label text-muted">
                {Math.round((turnosCount.TARDE / totalPorTurno) * 100)}% da demanda do período
              </span>
            </div>
          </Col>

          <Col xs={12} md={4}>
            <div className="p-4 rounded-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-dark">Noite</span>
                <span className="config-label text-muted">18:30 - 22:30</span>
              </div>
              <div className="mockup-heading fs-3 fw-bold text-dark mb-2">
                {turnosCount.NOITE}{' '}
                <small className="fs-6 fw-normal text-muted">reservas</small>
              </div>
              <ProgressBar
                now={Math.round((turnosCount.NOITE / totalPorTurno) * 100)}
                className="rounded-pill mb-2"
                style={{ height: '6px' }}
              />
              <span className="config-label text-muted">
                {Math.round((turnosCount.NOITE / totalPorTurno) * 100)}% da demanda do período
              </span>
            </div>
          </Col>
        </Row>
      </div>

      {/* Tabela de Ocupação Detalhada */}
      <div className="mockup-card overflow-hidden rel-print-table">
        <div className="p-4" style={{ backgroundColor: 'var(--surface-container-low)' }}>
          <span className="config-label text-muted d-block">Detalhamento por Recurso &middot; Período de {rotuloPeriodo}</span>
          <h5 className="fw-bold text-dark mockup-heading mb-0">Métricas Individuais de Ocupação & Ociosidade</h5>
          <span className="small text-muted">
            Carga horária teórica de referência para o período: {totalHorasTeoricasPeriodo}h ({diasUteisPeriodo} dia(s) útil(eis) × {Math.round(horasDiariasTeoricas * 10) / 10}h/dia, conforme os horários padrão da instituição).
          </span>
        </div>

        <div className="table-responsive">
          <Table hover className="gu-table align-middle mb-0 text-nowrap">
            <thead>
              <tr>
                <th className="ps-4">Instalação / Bem</th>
                <th>Localização</th>
                <th>Capacidade</th>
                <th className="text-center">Uso no Período</th>
                <th className="text-center">Taxa de Ocupação</th>
                <th className="text-center pe-4">Taxa de Ociosidade</th>
              </tr>
            </thead>
            <tbody>
              {itemStats.map((item) => (
                <tr key={item.id} className="gu-table__row">
                  <td className="ps-4">
                    <div className="fw-bold text-dark">{item.nome}</div>
                    <span className="config-label text-muted" style={{ fontSize: '0.65rem' }}>{item.tipo}</span>
                  </td>
                  <td>{item.localizacao}</td>
                  <td>{item.capacidade} lugares</td>
                  <td className="text-center font-monospace small fw-bold">
                    {item.horasOcupadas}h no período
                  </td>
                  <td className="text-center" style={{ minWidth: '160px' }}>
                    <div className="d-flex align-items-center gap-2 justify-content-center">
                      <ProgressBar
                        now={item.taxaOcupacao}
                        className="flex-grow-1 rounded-pill"
                        style={{ height: '6px' }}
                      />
                      <span className="small fw-bold">{item.taxaOcupacao}%</span>
                    </div>
                  </td>
                  <td className="text-center pe-4" style={{ minWidth: '160px' }}>
                    <div className="d-flex align-items-center gap-2 justify-content-center">
                      <ProgressBar
                        now={item.taxaOciosidade}
                        className="flex-grow-1 rounded-pill"
                        style={{ height: '6px', backgroundColor: 'var(--surface-container)' }}
                      />
                      <span className="small fw-bold text-muted">{item.taxaOciosidade}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;
