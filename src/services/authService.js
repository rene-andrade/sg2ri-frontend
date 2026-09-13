import api from './api';
import userService from './userService';
import { USER_ROLES } from '../utils/constants';

export const DEMO_USERS = [
  {
    id: '1',
    name: 'Profa. Helena',
    email: 'helena@sg2ri.edu.br',
    role: USER_ROLES.PROFESSOR,
    department: 'Departamento de Ciências Biológicas',
    matricula: 'PRF-82014',
    initials: 'HD',
  },
  {
    id: '2',
    name: 'Marcos',
    email: 'marcos@sg2ri.edu.br',
    role: USER_ROLES.ADMIN,
    department: 'Coordenação de Infraestrutura e Ativos',
    matricula: 'ADM-10022',
    initials: 'MC',
  },
  {
    id: '3',
    name: 'Lucas Pereira',
    email: 'aluno@sg2ri.edu.br',
    role: USER_ROLES.ALUNO,
    department: 'Engenharia de Software (Graduação)',
    matricula: '20220199',
    initials: 'LP',
  },
];

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('@sg2ri:token', token);
      localStorage.setItem('@sg2ri:user', JSON.stringify(user));
      return { user, token };
    } catch (apiError) {
      // Consulta primeiro a base viva de usuários (reflete edições feitas em
      // "Meu Perfil" ou na Gestão de Usuários); DEMO_USERS é só o fallback de
      // primeiro acesso, usado pelos atalhos da tela de login — nesse caso a
      // senha esperada é sempre "demo", a mesma usada pelos atalhos rápidos.
      const foundInStore = await userService.getUsuarioByEmail(email);
      const foundUser = foundInStore || DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      const senhaEsperada = foundInStore ? foundInStore.senha : 'demo';

      if (foundUser && password === senhaEsperada) {
        // Só verifica o status depois de confirmar a senha, para não revelar se
        // uma conta existe/está inativa a quem ainda nem acertou a credencial.
        if (foundUser.ativo === false) {
          throw new Error('Sua conta está inativa. Procure um administrador do sistema.');
        }
        const mockToken = `mock-jwt-token-${foundUser.role.toLowerCase()}-${Date.now()}`;
        localStorage.setItem('@sg2ri:token', mockToken);
        localStorage.setItem('@sg2ri:user', JSON.stringify(foundUser));
        return { user: foundUser, token: mockToken };
      }

      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }
      throw new Error('Credenciais inválidas ou serviço indisponível.');
    }
  },

  logout() {
    localStorage.removeItem('@sg2ri:token');
    localStorage.removeItem('@sg2ri:user');
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem('@sg2ri:user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('@sg2ri:token');
  },
};

export default authService;
