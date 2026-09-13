import api from './api';
import { TIPO_ITEM, STATUS_ITEM } from '../utils/constants';

const INITIAL_ITENS = [
  {
    id: '1',
    nome: 'Laboratório de Redes & Sistemas (Lab 101)',
    tipo: TIPO_ITEM.LABORATORIO,
    capacidade: 35,
    localizacao: 'Bloco B - 1º Andar',
    descricao: '35 computadores Dell i7, 16GB RAM, projetor Epson e switch de bancada.',
    status: STATUS_ITEM.ATIVO,
  },
  {
    id: '2',
    nome: 'Laboratório de Inteligência Artificial & Robótica',
    tipo: TIPO_ITEM.LABORATORIO,
    capacidade: 25,
    localizacao: 'Bloco B - 2º Andar (Sala 204)',
    descricao: 'Estações com GPUs dedicadas RTX 4080 e kits Arduino/Raspberry Pi.',
    status: STATUS_ITEM.ATIVO,
  },
  {
    id: '3',
    nome: 'Auditório Master Nobre',
    tipo: TIPO_ITEM.AUDITORIO,
    capacidade: 180,
    localizacao: 'Prédio Central - Térreo',
    descricao: 'Sistema de som surround, 2 microfones sem fio, projetor laser 4K e ar-condicionado central.',
    status: STATUS_ITEM.ATIVO,
  },
  {
    id: '4',
    nome: 'Sala de Seminários & Reuniões 03',
    tipo: TIPO_ITEM.SALA,
    capacidade: 20,
    localizacao: 'Bloco Administrativo - Sala 302',
    descricao: 'Mesa de conferência, smart TV 65" para apresentações e videoconferência.',
    status: STATUS_ITEM.ATIVO,
  },
  {
    id: '5',
    nome: 'Kit Projetor Móvel Epson + Caixa Amplificada 01',
    tipo: TIPO_ITEM.EQUIPAMENTO,
    capacidade: 1,
    localizacao: 'Almoxarifado de TI',
    descricao: 'Projetor Full HD HDMI, cabos adaptadores e caixa de som portátil com microfone.',
    status: STATUS_ITEM.ATIVO,
  },
  {
    id: '6',
    nome: 'Laboratório de Fabricação Digital (Makerspace)',
    tipo: TIPO_ITEM.LABORATORIO,
    capacidade: 15,
    localizacao: 'Bloco de Oficinas',
    descricao: 'Impressoras 3D, cortadora a laser e bancadas de eletrônica.',
    status: STATUS_ITEM.MANUTENCAO,
  },
];

function getLocalItens() {
  const stored = localStorage.getItem('@sg2ri:itens');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('@sg2ri:itens', JSON.stringify(INITIAL_ITENS));
  return INITIAL_ITENS;
}

function saveLocalItens(itens) {
  localStorage.setItem('@sg2ri:itens', JSON.stringify(itens));
}

export const itemService = {
  async getItens(filters = {}) {
    try {
      const response = await api.get('/itens', { params: filters });
      return response.data;
    } catch {
      let itens = getLocalItens();
      if (filters.tipo) {
        itens = itens.filter((i) => i.tipo === filters.tipo);
      }
      if (filters.status) {
        itens = itens.filter((i) => i.status === filters.status);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        itens = itens.filter(
          (i) =>
            i.nome.toLowerCase().includes(query) ||
            i.localizacao.toLowerCase().includes(query)
        );
      }
      return itens;
    }
  },

  async getItemById(id) {
    try {
      const response = await api.get(`/itens/${id}`);
      return response.data;
    } catch {
      const itens = getLocalItens();
      const found = itens.find((i) => String(i.id) === String(id));
      if (!found) throw new Error('Item não encontrado.');
      return found;
    }
  },

  async createItem(itemData) {
    try {
      const response = await api.post('/itens', itemData);
      return response.data;
    } catch {
      const itens = getLocalItens();
      const newItem = {
        ...itemData,
        id: String(Date.now()),
        status: itemData.status || STATUS_ITEM.ATIVO,
      };
      const updated = [newItem, ...itens];
      saveLocalItens(updated);
      return newItem;
    }
  },

  async updateItem(id, itemData) {
    try {
      const response = await api.put(`/itens/${id}`, itemData);
      return response.data;
    } catch {
      const itens = getLocalItens();
      const index = itens.findIndex((i) => String(i.id) === String(id));
      if (index === -1) throw new Error('Item não encontrado.');
      const updatedItem = { ...itens[index], ...itemData };
      itens[index] = updatedItem;
      saveLocalItens(itens);
      return updatedItem;
    }
  },

  async deleteItem(id) {
    try {
      await api.delete(`/itens/${id}`);
      return true;
    } catch {
      const itens = getLocalItens();
      const filtered = itens.filter((i) => String(i.id) !== String(id));
      saveLocalItens(filtered);
      return true;
    }
  },
};

export default itemService;
