import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLE_LABELS, USER_ROLES } from '../../utils/constants';
import GestaoUsuarios from './GestaoUsuarios';

// ── Toast compartilhado ───────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3800);
  };
  return { toast, showToast };
}

// ── Painel de Perfil (igual para todos) ──────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PerfilPanel({ user, updateUser, showToast }) {
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(user?.avatarUrl ?? null);
  const [nomeCompleto, setNomeCompleto] = useState(user?.name ?? '');
  const [matricula, setMatricula] = useState(user?.matricula ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!nomeCompleto.trim()) {
      showToast('error', 'O nome completo não pode ficar em branco.');
      return;
    }
    if (!matricula.trim()) {
      showToast('error', 'A matrícula não pode ficar em branco.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      showToast('error', 'Informe um e-mail válido.');
      return;
    }
    if (novaSenha && novaSenha !== confirmarSenha) {
      showToast('error', 'As senhas não coincidem. Por favor, verifique e tente novamente.');
      return;
    }
    if (novaSenha && novaSenha.length < 8) {
      showToast('error', 'A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        name: nomeCompleto.trim(),
        matricula: matricula.trim(),
        email: email.trim(),
        ...(photoPreview ? { avatarUrl: photoPreview } : {}),
      });
      showToast('success', 'Alterações salvas com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err) {
      showToast('error', err.message ?? 'Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    setNomeCompleto(user?.name ?? '');
    setMatricula(user?.matricula ?? '');
    setEmail(user?.email ?? '');
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setPhotoPreview(user?.avatarUrl ?? null);
  };

  const initials = user?.initials ?? user?.name?.slice(0, 2).toUpperCase() ?? 'US';
  const roleLabel = USER_ROLE_LABELS[user?.role] ?? user?.role ?? 'Usuário';
  const memberSince = 'Jan 2024';

  return (
    <form onSubmit={handleSalvar} noValidate>
      <div className="config-page__body">
        {/* ── Card: Foto de Perfil ─────────────────────────────────────── */}
        <div className="mockup-card config-photo-card">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            id="foto-upload"
            onChange={handlePhotoChange}
            aria-label="Selecionar nova foto de perfil"
          />
          <div className="config-photo-wrapper">
            {photoPreview ? (
              <img src={photoPreview} alt="Foto de perfil" className="config-photo-img" />
            ) : (
              <div className="config-photo-avatar" aria-hidden="true">{initials}</div>
            )}
            <button
              type="button"
              className="config-photo-cam-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Alterar foto"
              aria-label="Alterar foto de perfil"
            >
              <i className="bi bi-camera-fill" />
            </button>
          </div>

          <p className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1.05rem' }}>
            {user?.name ?? 'Usuário'}
          </p>
          <p className="text-muted mb-3" style={{ fontSize: '0.82rem' }}>
            Membro desde {memberSince}
          </p>
          <button
            type="button"
            className="config-photo-link"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Alterar foto de perfil"
          >
            Alterar Foto
          </button>
        </div>

        {/* ── Painel Direito ─────────────────────────────────────────────── */}
        <div className="config-right-panel">
          {/* Informações Pessoais */}
          <div className="mockup-card config-form-card">
            <div className="config-form-card__title">
              <i className="bi bi-person me-2" />
              Informações Pessoais
            </div>
            <div className="config-form-grid">
              <div className="config-form-group config-form-group--wide">
                <label htmlFor="nome-completo" className="config-label">Nome Completo</label>
                <input
                  id="nome-completo"
                  type="text"
                  className="config-input"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="config-form-group">
                <label htmlFor="matricula" className="config-label">Matrícula</label>
                <input
                  id="matricula"
                  type="text"
                  className="config-input"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Sua matrícula"
                  required
                />
              </div>

              <div className="config-form-group config-form-group--full">
                <label htmlFor="email" className="config-label">E-mail Institucional</label>
                <input
                  id="email"
                  type="email"
                  className="config-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@sg2ri.edu.br"
                  required
                />
              </div>

              <div className="config-form-group config-form-group--full">
                <label htmlFor="perfil" className="config-label">Perfil</label>
                <div className="config-input config-input--readonly d-flex align-items-center justify-content-between">
                  <span>{roleLabel}</span>
                  <span className="config-input-badge" title="Campo não editável" aria-label="Campo somente leitura">Info</span>
                </div>
                <small className="text-muted d-block mt-1">
                  O perfil de acesso é atribuído pela administração e não pode ser alterado por aqui.
                </small>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="mockup-card config-form-card">
            <div className="config-form-card__title">
              <i className="bi bi-lock me-2" />
              Segurança
            </div>
            <div className="config-form-grid">
              <div className="config-form-group config-form-group--full">
                <label htmlFor="senha-atual" className="config-label">Senha Atual</label>
                <input
                  id="senha-atual"
                  type="password"
                  className="config-input"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div className="config-form-group">
                <label htmlFor="nova-senha" className="config-label">Nova Senha</label>
                <input
                  id="nova-senha"
                  type="password"
                  className="config-input"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <div className="config-form-group">
                <label htmlFor="confirmar-senha" className="config-label">Confirmar Nova Senha</label>
                <input
                  id="confirmar-senha"
                  type="password"
                  className="config-input"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="config-actions">
            <button type="button" className="config-btn-cancel" onClick={handleCancelar} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="config-btn-save" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ── Página principal: Configuracoes ──────────────────────────────────────────
export function Configuracoes() {
  const { user, updateUser } = useAuth();
  const { toast, showToast } = useToast();
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  // Abas só aparecem para admin
  const TABS = isAdmin
    ? [
        { id: 'perfil',   label: 'Meu Perfil',         icon: 'bi-person-circle' },
        { id: 'usuarios', label: 'Gestão de Usuários',  icon: 'bi-people-fill'   },
      ]
    : null;

  const [activeTab, setActiveTab] = useState('perfil');

  return (
    <div className="config-page">
      {/* Toast global de feedback */}
      {toast && (
        <div
          className={`config-toast config-toast--${toast.type}`}
          role="alert"
          aria-live="polite"
        >
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-2`} />
          {toast.msg}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="config-page__header mb-4">
        <h1 className="mockup-heading mb-1" style={{ fontSize: '1.65rem' }}>
          Configurações{isAdmin ? ' do Sistema' : ' de Perfil'}
        </h1>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          {isAdmin
            ? 'Gerencie seu perfil, segurança e os usuários cadastrados no sistema.'
            : 'Gerencie suas informações pessoais e preferências de segurança.'}
        </p>
      </div>

      {/* Abas (somente admin) */}
      {TABS && (
        <div className="config-tabs" role="tablist" aria-label="Seções de configurações">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tab-panel-${tab.id}`}
              id={`tab-btn-${tab.id}`}
              className={`config-tab-btn ${activeTab === tab.id ? 'config-tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bi ${tab.icon} me-2`} />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Conteúdo das abas */}
      <div
        id={`tab-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-btn-${activeTab}`}
        className="config-tab-content"
      >
        {activeTab === 'perfil' || !isAdmin ? (
          <PerfilPanel user={user} updateUser={updateUser} showToast={showToast} />
        ) : (
          <div className="d-flex flex-column gap-4">
            <GestaoUsuarios showToast={showToast} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Configuracoes;
