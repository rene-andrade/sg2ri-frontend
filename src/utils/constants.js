/**
 * Constantes globais do sistema SG2RI
 * Alinhadas ao Design System dos Mockups Oficiais (classes mockup-*)
 */

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  PROFESSOR: 'PROFESSOR',
  ALUNO: 'ALUNO',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.PROFESSOR]: 'Professor',
  [USER_ROLES.ALUNO]: 'Aluno',
};

export const STATUS_RESERVA = {
  PENDENTE: 'PENDENTE',
  APROVADA: 'APROVADA',
  RECUSADA: 'RECUSADA',
  CANCELADA: 'CANCELADA',
};

export const STATUS_RESERVA_META = {
  [STATUS_RESERVA.PENDENTE]: {
    label: 'Pendente',
    chipClass: 'mockup-chip mockup-chip--warning',
    icon: 'bi-hourglass-split',
  },
  [STATUS_RESERVA.APROVADA]: {
    label: 'Aprovada',
    chipClass: 'mockup-chip mockup-chip--success',
    icon: 'bi-check-circle-fill',
  },
  [STATUS_RESERVA.RECUSADA]: {
    label: 'Recusada',
    chipClass: 'mockup-chip mockup-chip--error',
    icon: 'bi-x-circle-fill',
  },
  [STATUS_RESERVA.CANCELADA]: {
    label: 'Cancelada',
    chipClass: 'mockup-chip mockup-chip--neutral',
    icon: 'bi-slash-circle-fill',
  },
};

export const TIPO_ITEM = {
  LABORATORIO: 'LABORATORIO',
  SALA: 'SALA',
  AUDITORIO: 'AUDITORIO',
  EQUIPAMENTO: 'EQUIPAMENTO',
};

export const TIPO_ITEM_LABELS = {
  [TIPO_ITEM.LABORATORIO]: 'Laboratório de Informática / Especializado',
  [TIPO_ITEM.SALA]: 'Sala de Aula / Reuniões',
  [TIPO_ITEM.AUDITORIO]: 'Auditório',
  [TIPO_ITEM.EQUIPAMENTO]: 'Equipamento Móvel (Projetor/Caixa/Notebook)',
};

export const TIPO_ITEM_ICONS = {
  [TIPO_ITEM.LABORATORIO]: 'bi-pc-display',
  [TIPO_ITEM.SALA]: 'bi-door-open',
  [TIPO_ITEM.AUDITORIO]: 'bi-mic',
  [TIPO_ITEM.EQUIPAMENTO]: 'bi-projector',
};

export const STATUS_ITEM = {
  ATIVO: 'ATIVO',
  MANUTENCAO: 'MANUTENCAO',
  INATIVO: 'INATIVO',
};

export const CONDICAO_ITEM = {
  OK: 'OK',
  DANIFICADO: 'DANIFICADO',
};

export const CONDICAO_ITEM_LABELS = {
  [CONDICAO_ITEM.OK]: 'Em boas condições',
  [CONDICAO_ITEM.DANIFICADO]: 'Danificado / Avariado',
};

export const TURNOS = [
  { value: 'MANHA', label: 'Manhã (07:30 - 12:00)' },
  { value: 'TARDE', label: 'Tarde (13:30 - 18:00)' },
  { value: 'NOITE', label: 'Noite (18:30 - 22:30)' },
];

export const HORARIOS_PADRAO = [
  '07:30 - 09:10',
  '09:20 - 11:00',
  '11:10 - 12:50',
  '13:30 - 15:10',
  '15:20 - 17:00',
  '17:10 - 18:50',
  '19:00 - 20:40',
  '20:50 - 22:30',
];
