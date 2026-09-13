import api from './api';
import { STATUS_RESERVA } from '../utils/constants';

const INITIAL_RESERVAS = [
  {
    id: 'res-101',
    itemId: '1',
    itemNome: 'Laboratório de Redes & Sistemas (Lab 101)',
    itemTipo: 'LABORATORIO',
    usuarioId: '2',
    usuarioNome: 'Profa. Ana Oliveira',
    usuarioRole: 'PROFESSOR',
    data: '2026-09-10',
    turno: 'MANHA',
    horario: '07:30 - 11:00',
    finalidade: 'Aula prática de Configuração de Roteadores Cisco e Sub-redes.',
    quantidadePessoas: 32,
    status: STATUS_RESERVA.APROVADA,
    observacaoAdmin: 'Aprovado para a turma de Engenharia da Computação.',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'res-102',
    itemId: '3',
    itemNome: 'Auditório Master Nobre',
    itemTipo: 'AUDITORIO',
    usuarioId: '2',
    usuarioNome: 'Profa. Ana Oliveira',
    usuarioRole: 'PROFESSOR',
    data: '2026-09-12',
    turno: 'NOITE',
    horario: '19:00 - 22:00',
    finalidade: 'Palestra de Abertura da Semana de Tecnologia com palestrante convidado.',
    quantidadePessoas: 140,
    status: STATUS_RESERVA.PENDENTE,
    observacaoAdmin: null,
    createdAt: '2026-09-02T14:30:00Z',
  },
  {
    id: 'res-103',
    itemId: '2',
    itemNome: 'Laboratório de Inteligência Artificial & Robótica',
    itemTipo: 'LABORATORIO',
    usuarioId: '3',
    usuarioNome: 'Lucas Pereira',
    usuarioRole: 'ALUNO',
    data: '2026-09-15',
    turno: 'TARDE',
    horario: '13:30 - 17:00',
    finalidade: 'Ensaio da equipe para a Maratona de Programação e Robótica móvel.',
    quantidadePessoas: 8,
    status: STATUS_RESERVA.PENDENTE,
    observacaoAdmin: null,
    createdAt: '2026-09-05T09:15:00Z',
  },
  {
    id: 'res-104',
    itemId: '5',
    itemNome: 'Kit Projetor Móvel Epson + Caixa Amplificada 01',
    itemTipo: 'EQUIPAMENTO',
    usuarioId: '3',
    usuarioNome: 'Lucas Pereira',
    usuarioRole: 'ALUNO',
    data: '2026-09-08',
    turno: 'MANHA',
    horario: '09:20 - 11:00',
    finalidade: 'Apresentação de trabalho de TCC no Bloco C.',
    quantidadePessoas: 15,
    status: STATUS_RESERVA.APROVADA,
    observacaoAdmin: 'Retirar no almoxarifado 15 minutos antes com documento.',
    createdAt: '2026-09-03T11:00:00Z',
  },
  {
    id: 'res-105',
    itemId: '4',
    itemNome: 'Sala de Seminários & Reuniões 03',
    itemTipo: 'SALA',
    usuarioId: '2',
    usuarioNome: 'Profa. Ana Oliveira',
    usuarioRole: 'PROFESSOR',
    data: '2026-09-04',
    turno: 'TARDE',
    horario: '14:00 - 16:00',
    finalidade: 'Reunião de colegiado de curso e alinhamento de disciplinas.',
    quantidadePessoas: 12,
    status: STATUS_RESERVA.APROVADA,
    observacaoAdmin: 'Liberado.',
    createdAt: '2026-08-30T16:00:00Z',
  },
];

function getLocalReservas() {
  const stored = localStorage.getItem('@sg2ri:reservas');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('@sg2ri:reservas', JSON.stringify(INITIAL_RESERVAS));
  return INITIAL_RESERVAS;
}

function saveLocalReservas(reservas) {
  localStorage.setItem('@sg2ri:reservas', JSON.stringify(reservas));
}

export const reservaService = {
  async getReservas(filters = {}) {
    try {
      const response = await api.get('/reservas', { params: filters });
      return response.data;
    } catch {
      let reservas = getLocalReservas();
      if (filters.status) {
        reservas = reservas.filter((r) => r.status === filters.status);
      }
      if (filters.data) {
        reservas = reservas.filter((r) => r.data === filters.data);
      }
      if (filters.itemId) {
        reservas = reservas.filter((r) => String(r.itemId) === String(filters.itemId));
      }
      return reservas;
    }
  },

  async getMinhasReservas(userId) {
    try {
      const response = await api.get('/reservas/minhas');
      return response.data;
    } catch {
      const reservas = getLocalReservas();
      if (!userId) return reservas;
      return reservas.filter((r) => String(r.usuarioId) === String(userId));
    }
  },

  async createReserva(reservaData) {
    try {
      const response = await api.post('/reservas', reservaData);
      return response.data;
    } catch {
      const reservas = getLocalReservas();
      const newReserva = {
        ...reservaData,
        id: `res-${Date.now()}`,
        status: STATUS_RESERVA.PENDENTE,
        observacaoAdmin: null,
        createdAt: new Date().toISOString(),
      };
      const updated = [newReserva, ...reservas];
      saveLocalReservas(updated);
      return newReserva;
    }
  },

  async aprovarReserva(id, observacaoAdmin = '') {
    try {
      const response = await api.patch(`/reservas/${id}/aprovar`, { observacaoAdmin });
      return response.data;
    } catch {
      const reservas = getLocalReservas();
      const index = reservas.findIndex((r) => String(r.id) === String(id));
      if (index === -1) throw new Error('Reserva não encontrada.');
      reservas[index] = {
        ...reservas[index],
        status: STATUS_RESERVA.APROVADA,
        observacaoAdmin: observacaoAdmin || 'Aprovado pela administração.',
      };
      saveLocalReservas(reservas);
      return reservas[index];
    }
  },

  async recusarReserva(id, motivoRecusa = '') {
    try {
      const response = await api.patch(`/reservas/${id}/recusar`, { motivoRecusa });
      return response.data;
    } catch {
      const reservas = getLocalReservas();
      const index = reservas.findIndex((r) => String(r.id) === String(id));
      if (index === -1) throw new Error('Reserva não encontrada.');
      reservas[index] = {
        ...reservas[index],
        status: STATUS_RESERVA.RECUSADA,
        observacaoAdmin: motivoRecusa || 'Solicitação recusada pela administração.',
      };
      saveLocalReservas(reservas);
      return reservas[index];
    }
  },

  async cancelarReserva(id) {
    try {
      const response = await api.patch(`/reservas/${id}/cancelar`);
      return response.data;
    } catch {
      const reservas = getLocalReservas();
      const index = reservas.findIndex((r) => String(r.id) === String(id));
      if (index === -1) throw new Error('Reserva não encontrada.');
      reservas[index] = {
        ...reservas[index],
        status: STATUS_RESERVA.CANCELADA,
      };
      saveLocalReservas(reservas);
      return reservas[index];
    }
  },

  async registrarRetirada(id) {
    try {
      const response = await api.patch(`/reservas/${id}/retirada`);
      return response.data;
    } catch {
      const reservas = getLocalReservas();
      const index = reservas.findIndex((r) => String(r.id) === String(id));
      if (index === -1) throw new Error('Reserva não encontrada.');
      reservas[index] = {
        ...reservas[index],
        retiradoEm: new Date().toISOString(),
      };
      saveLocalReservas(reservas);
      return reservas[index];
    }
  },

  async registrarDevolucao(id, { condicao, observacao = '' } = {}) {
    try {
      const response = await api.patch(`/reservas/${id}/devolucao`, { condicao, observacao });
      return response.data;
    } catch {
      const reservas = getLocalReservas();
      const index = reservas.findIndex((r) => String(r.id) === String(id));
      if (index === -1) throw new Error('Reserva não encontrada.');
      reservas[index] = {
        ...reservas[index],
        devolvidoEm: new Date().toISOString(),
        condicaoDevolucao: condicao || 'OK',
        observacaoDevolucao: observacao,
      };
      saveLocalReservas(reservas);
      return reservas[index];
    }
  },
};

export default reservaService;
