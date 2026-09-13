import React, { createContext, useState, useCallback } from 'react';
import authService, { DEMO_USERS } from '../services/authService';
import userService from '../services/userService';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  // Inicialização síncrona de estado a partir do LocalStorage ou fallback para o primeiro acesso demo
  const [user, setUser] = useState(() => {
    try {
      const storedUser = authService.getCurrentUser();
      if (storedUser) return storedUser;

      // Padrão de desenvolvimento para facilitar o primeiro acesso:
      const defaultDemo = DEMO_USERS[0];
      localStorage.setItem('@sg2ri:user', JSON.stringify(defaultDemo));
      return defaultDemo;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      const storedToken = authService.getToken();
      if (storedToken) return storedToken;

      const defaultToken = `mock-jwt-token-admin-${Date.now()}`;
      localStorage.setItem('@sg2ri:token', defaultToken);
      return defaultToken;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { user: loggedUser, token: loggedToken } = await authService.login(email, password);
      setUser(loggedUser);
      setToken(loggedToken);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const hasRole = useCallback(
    (allowedRoles) => {
      if (!user || !user.role) return false;
      if (!allowedRoles || allowedRoles.length === 0) return true;
      return allowedRoles.includes(user.role);
    },
    [user]
  );

  const updateUser = useCallback(
    async (updates) => {
      const merged = { ...user, ...updates };
      // Sincroniza com a base compartilhada de usuários antes de confirmar,
      // para que um e-mail em conflito com outra conta seja rejeitado aqui
      // e a Gestão de Usuários sempre reflita as edições feitas pelo próprio usuário.
      if (merged?.id) {
        await userService.updateUsuario(merged.id, merged);
      }
      localStorage.setItem('@sg2ri:user', JSON.stringify(merged));
      setUser(merged);
      return merged;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        hasRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
