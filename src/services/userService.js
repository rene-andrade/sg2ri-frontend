/**
 * userService.js
 * Fonte única de verdade dos usuários do sistema, persistida em localStorage.
 * É consultada tanto pela Gestão de Usuários (admin) quanto pelo login mock e
 * pela edição de "Meu Perfil", para que as três telas nunca fiquem dessincronizadas.
 * Em produção, substituir as funções por chamadas reais à API (api.get/post/put/delete).
 */
import { USER_ROLES } from '../utils/constants';

const STORAGE_KEY = '@sg2ri:usuarios';

const SEED_USUARIOS = [
  {
    id: '1',
    name: 'Profa. Helena',
    email: 'helena@sg2ri.edu.br',
    role: USER_ROLES.PROFESSOR,
    department: 'Departamento de Ciências Biológicas',
    matricula: 'PRF-82014',
    initials: 'HD',
    senha: 'demo',
    ativo: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Marcos',
    email: 'marcos@sg2ri.edu.br',
    role: USER_ROLES.ADMIN,
    department: 'Coordenação de Infraestrutura e Ativos',
    matricula: 'ADM-10022',
    initials: 'MC',
    senha: 'demo',
    ativo: true,
    createdAt: '2023-08-01',
  },
  {
    id: '3',
    name: 'Lucas Pereira',
    email: 'aluno@sg2ri.edu.br',
    role: USER_ROLES.ALUNO,
    department: 'Engenharia de Software (Graduação)',
    matricula: '20220199',
    initials: 'LP',
    senha: 'demo',
    ativo: true,
    createdAt: '2022-02-10',
  },
];

/** Preenche "senha" para registros salvos antes desse campo existir (ex.: sessões anteriores) */
function migrarUsuarios(usuarios) {
  let mudou = false;
  const migrados = usuarios.map((u) => {
    if (u.senha) return u;
    mudou = true;
    return { ...u, senha: 'demo' };
  });
  if (mudou) saveLocalUsuarios(migrados);
  return migrados;
}

function getLocalUsuarios() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return migrarUsuarios(JSON.parse(stored));
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USUARIOS));
  return SEED_USUARIOS;
}

function saveLocalUsuarios(usuarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

function nextId(usuarios) {
  const maxId = usuarios.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0);
  return String(maxId + 1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── CRUD ─────────────────────────────────────────────────────────────────────
export const userService = {
  /** Lista todos os usuários */
  async getUsuarios() {
    await delay();
    return [...getLocalUsuarios()];
  },

  /** Busca um usuário pelo e-mail (usado pelo login mock) */
  async getUsuarioByEmail(email) {
    const usuarios = getLocalUsuarios();
    return usuarios.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase()) ?? null;
  },

  /** Cria um novo usuário */
  async createUsuario(data) {
    await delay();
    const usuarios = getLocalUsuarios();
    const emailExiste = usuarios.some(
      (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (emailExiste) throw new Error(`O e-mail "${data.email}" já está cadastrado.`);

    const novo = {
      id: nextId(usuarios),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      department: data.department?.trim() ?? '',
      matricula: data.matricula?.trim() ?? '',
      initials: initials(data.name),
      senha: data.senha.trim(),
      ativo: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    saveLocalUsuarios([...usuarios, novo]);
    return novo;
  },

  /** Atualiza um usuário existente (usado pela Gestão de Usuários e pela edição de "Meu Perfil") */
  async updateUsuario(id, data) {
    await delay();
    const usuarios = getLocalUsuarios();
    const idx = usuarios.findIndex((u) => u.id === String(id));
    if (idx === -1) throw new Error('Usuário não encontrado.');

    // Verifica duplicidade de e-mail em outros registros
    const emailExiste = usuarios.some(
      (u) => u.id !== String(id) && u.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (emailExiste) throw new Error(`O e-mail "${data.email}" já está em uso por outro usuário.`);

    const atualizado = {
      ...usuarios[idx],
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      department: data.department?.trim() ?? '',
      matricula: data.matricula?.trim() ?? '',
      initials: initials(data.name),
      ...(data.senha && data.senha.trim() ? { senha: data.senha.trim() } : {}),
    };
    usuarios[idx] = atualizado;
    saveLocalUsuarios(usuarios);
    return atualizado;
  },

  /** Ativa/desativa o acesso de um usuário sem excluí-lo */
  async toggleAtivo(id) {
    await delay();
    const usuarios = getLocalUsuarios();
    const idx = usuarios.findIndex((u) => u.id === String(id));
    if (idx === -1) throw new Error('Usuário não encontrado.');
    usuarios[idx] = { ...usuarios[idx], ativo: !usuarios[idx].ativo };
    saveLocalUsuarios(usuarios);
    return usuarios[idx];
  },

  /** Remove um usuário */
  async deleteUsuario(id) {
    await delay();
    const usuarios = getLocalUsuarios();
    const filtrados = usuarios.filter((u) => u.id !== String(id));
    if (filtrados.length === usuarios.length) throw new Error('Usuário não encontrado.');
    saveLocalUsuarios(filtrados);
  },

  /**
   * Importação em massa via conteúdo de CSV.
   * Formato esperado (com cabeçalho):
   *   nome,email,matricula,perfil,departamento,senha
   *
   * Retorna: { imported: Usuario[], errors: { linha, mensagem }[] }
   */
  async importUsuariosCSV(csvText) {
    await delay(600);
    const ROLES_VALIDOS = Object.values(USER_ROLES);
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    if (lines.length < 2) {
      throw new Error('O arquivo CSV está vazio ou não possui dados além do cabeçalho.');
    }

    const usuarios = getLocalUsuarios();
    const imported = [];
    const errors = [];

    // Ignora o cabeçalho (linha 0)
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      const [nome, email, matricula, perfil, departamento, senha] = cols;
      const linhaNum = i + 1;

      // Validações
      if (!nome) { errors.push({ linha: linhaNum, mensagem: 'Campo "nome" obrigatório.' }); continue; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ linha: linhaNum, mensagem: `E-mail inválido: "${email}".` }); continue;
      }
      if (!perfil || !ROLES_VALIDOS.includes(perfil.toUpperCase())) {
        errors.push({ linha: linhaNum, mensagem: `Perfil inválido: "${perfil}". Use ADMIN, PROFESSOR ou ALUNO.` }); continue;
      }
      if (!senha || senha.length < 8) {
        errors.push({ linha: linhaNum, mensagem: 'Senha obrigatória (mínimo 8 caracteres).' }); continue;
      }
      if (usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        errors.push({ linha: linhaNum, mensagem: `E-mail duplicado: "${email}".` }); continue;
      }

      const novo = {
        id: nextId(usuarios),
        name: nome,
        email: email.toLowerCase(),
        role: perfil.toUpperCase(),
        department: departamento ?? '',
        matricula: matricula ?? '',
        initials: initials(nome),
        senha,
        ativo: true,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      usuarios.push(novo);
      imported.push(novo);
    }

    saveLocalUsuarios(usuarios);
    return { imported, errors };
  },
};

export default userService;
