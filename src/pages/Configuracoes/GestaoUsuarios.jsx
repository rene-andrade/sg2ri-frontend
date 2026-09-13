import React, { useState, useEffect, useCallback, useRef } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES, USER_ROLE_LABELS } from '../../utils/constants';

// ── Helpers ──────────────────────────────────────────────────────────────────
const ROLE_BADGE_CLASS = {
  [USER_ROLES.ADMIN]:     'role-badge role-badge--admin',
  [USER_ROLES.PROFESSOR]: 'role-badge role-badge--professor',
  [USER_ROLES.ALUNO]:     'role-badge role-badge--aluno',
};

const EMPTY_FORM = {
  name: '',
  email: '',
  matricula: '',
  role: USER_ROLES.PROFESSOR,
  department: '',
  senha: '',
};

// ── Sub-componente: Modal de Cadastro / Edição ───────────────────────────────
function UsuarioModal({ show, onClose, onSaved, editingUser, showToast }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(editingUser
        ? { name: editingUser.name, email: editingUser.email, matricula: editingUser.matricula, role: editingUser.role, department: editingUser.department, senha: '' }
        : EMPTY_FORM
      );
    }
  }, [show, editingUser]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser && form.senha.length < 8) {
      showToast('error', 'A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (editingUser && form.senha && form.senha.length < 8) {
      showToast('error', 'A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        await userService.updateUsuario(editingUser.id, form);
        showToast('success', `Usuário "${form.name}" atualizado com sucesso.`);
      } else {
        await userService.createUsuario(form);
        showToast('success', `Usuário "${form.name}" cadastrado com sucesso.`);
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast('error', err.message ?? 'Erro ao salvar usuário.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gu-modal-backdrop" role="dialog" aria-modal="true" aria-label={editingUser ? 'Editar usuário' : 'Novo usuário'}>
      <div className="gu-modal">
        {/* Header */}
        <div className="gu-modal__header">
          <div className="gu-modal__title-row">
            <span className="gu-modal__icon">
              <i className={`bi ${editingUser ? 'bi-pencil-square' : 'bi-person-plus-fill'}`} />
            </span>
            <h2 className="gu-modal__title">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
          </div>
          <button
            type="button"
            className="gu-modal__close"
            onClick={onClose}
            aria-label="Fechar"
            disabled={saving}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="gu-modal__body">
            <div className="config-form-grid">
              {/* Nome */}
              <div className="config-form-group config-form-group--full">
                <label htmlFor="gu-nome" className="config-label">Nome Completo *</label>
                <input
                  id="gu-nome"
                  name="name"
                  type="text"
                  className="config-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nome completo do usuário"
                  required
                  disabled={saving}
                />
              </div>

              {/* E-mail */}
              <div className="config-form-group config-form-group--full">
                <label htmlFor="gu-email" className="config-label">E-mail Institucional *</label>
                <input
                  id="gu-email"
                  name="email"
                  type="email"
                  className="config-input"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="usuario@sg2ri.edu.br"
                  required
                  disabled={saving}
                />
              </div>

              {/* Matrícula */}
              <div className="config-form-group">
                <label htmlFor="gu-matricula" className="config-label">Matrícula</label>
                <input
                  id="gu-matricula"
                  name="matricula"
                  type="text"
                  className="config-input"
                  value={form.matricula}
                  onChange={handleChange}
                  placeholder="Ex: PRF-00123"
                  disabled={saving}
                />
              </div>

              {/* Perfil */}
              <div className="config-form-group">
                <label htmlFor="gu-perfil" className="config-label">Perfil de Acesso *</label>
                <select
                  id="gu-perfil"
                  name="role"
                  className="config-input config-select"
                  value={form.role}
                  onChange={handleChange}
                  required
                  disabled={saving}
                >
                  {Object.entries(USER_ROLE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Departamento */}
              <div className="config-form-group config-form-group--full">
                <label htmlFor="gu-dept" className="config-label">Departamento / Curso</label>
                <input
                  id="gu-dept"
                  name="department"
                  type="text"
                  className="config-input"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Ex: Engenharia de Software"
                  disabled={saving}
                />
              </div>

              {/* Senha */}
              <div className="config-form-group config-form-group--full">
                <label htmlFor="gu-senha" className="config-label">
                  {editingUser ? 'Nova Senha' : 'Senha *'}
                </label>
                <input
                  id="gu-senha"
                  name="senha"
                  type="password"
                  className="config-input"
                  value={form.senha}
                  onChange={handleChange}
                  placeholder={editingUser ? 'Deixe em branco para manter a senha atual' : 'Mínimo 8 caracteres'}
                  minLength={8}
                  required={!editingUser}
                  disabled={saving}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="gu-modal__footer">
            <button type="button" className="config-btn-cancel" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="config-btn-save" disabled={saving}>
              {saving ? (
                <><span className="gu-spinner" /> Salvando…</>
              ) : editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sub-componente: Modal de Confirmação ─────────────────────────────────────
function ConfirmDeleteModal({ user, onConfirm, onCancel, loading }) {
  if (!user) return null;
  return (
    <div className="gu-modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirmar exclusão">
      <div className="gu-modal gu-modal--sm">
        <div className="gu-modal__header">
          <div className="gu-modal__title-row">
            <span className="gu-modal__icon gu-modal__icon--danger">
              <i className="bi bi-trash3-fill" />
            </span>
            <h2 className="gu-modal__title">Excluir Usuário</h2>
          </div>
        </div>
        <div className="gu-modal__body">
          <p style={{ color: '#475569', lineHeight: 1.6 }}>
            Tem certeza que deseja excluir <strong>{user.name}</strong>?
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="gu-modal__footer">
          <button type="button" className="config-btn-cancel" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="button" className="gu-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="gu-spinner" /> Excluindo…</> : 'Excluir Definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componente: Zona de Upload CSV ───────────────────────────────────────
function CsvUploadZone({ onImported, showToast }) {
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null); // { imported, errors }
  const fileRef = useRef(null);

  const processFile = async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      showToast('error', 'Por favor, selecione um arquivo .csv válido.');
      return;
    }
    setImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const res = await userService.importUsuariosCSV(text);
      setResult(res);
      if (res.imported.length > 0) {
        showToast('success', `${res.imported.length} usuário(s) importado(s) com sucesso.`);
        onImported();
      }
      if (res.errors.length > 0 && res.imported.length === 0) {
        showToast('error', 'Nenhum usuário importado. Verifique os erros abaixo.');
      }
    } catch (err) {
      showToast('error', err.message ?? 'Erro ao processar o arquivo CSV.');
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = '';
  };

  return (
    <div className="mockup-card config-form-card">
      <div className="config-form-card__title">
        <i className="bi bi-file-earmark-arrow-up me-2" />
        Importação em Massa via CSV
      </div>

      {/* Zona de drop */}
      <div
        className={`csv-drop-zone ${dragOver ? 'csv-drop-zone--drag' : ''} ${importing ? 'csv-drop-zone--loading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !importing && fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Clique ou arraste um arquivo CSV para importar usuários"
        onKeyDown={(e) => e.key === 'Enter' && !importing && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="d-none"
          onChange={handleFileChange}
          aria-hidden="true"
        />
        {importing ? (
          <>
            <span className="csv-drop-zone__spinner" />
            <p className="csv-drop-zone__text">Processando arquivo…</p>
          </>
        ) : (
          <>
            <i className="bi bi-cloud-upload csv-drop-zone__icon" />
            <p className="csv-drop-zone__text">
              <strong>Clique para selecionar</strong> ou arraste o arquivo aqui
            </p>
            <p className="csv-drop-zone__hint">Somente arquivos .csv</p>
          </>
        )}
      </div>

      {/* Modelo de CSV */}
      <div className="csv-model-hint">
        <i className="bi bi-info-circle me-1" />
        Formato esperado:&nbsp;
        <code>nome, email, matricula, perfil, departamento, senha</code>
        &nbsp;— perfil: <code>ADMIN</code>, <code>PROFESSOR</code> ou <code>ALUNO</code>; senha: mínimo 8 caracteres
      </div>

      {/* Resultado da importação */}
      {result && (
        <div className="csv-result">
          {result.imported.length > 0 && (
            <div className="csv-result__success">
              <i className="bi bi-check-circle-fill me-2" />
              {result.imported.length} usuário(s) importado(s) com sucesso.
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="csv-result__errors">
              <p className="csv-result__errors-title">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {result.errors.length} linha(s) com erro:
              </p>
              <ul className="csv-result__errors-list">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    <strong>Linha {e.linha}:</strong> {e.mensagem}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente principal: GestaoUsuarios ─────────────────────────────────────
export function GestaoUsuarios({ showToast }) {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      showToast('error', 'Erro ao carregar lista de usuários.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await userService.deleteUsuario(deletingUser.id);
      showToast('success', `Usuário "${deletingUser.name}" removido.`);
      setDeletingUser(null);
      fetchUsuarios();
    } catch (err) {
      showToast('error', err.message ?? 'Erro ao excluir usuário.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteClick = (u) => {
    if (String(u.id) === String(currentUser?.id)) {
      showToast('error', 'Você não pode excluir a própria conta enquanto estiver conectado.');
      return;
    }
    setDeletingUser(u);
  };

  const handleToggleClick = (u) => {
    if (String(u.id) === String(currentUser?.id)) {
      showToast('error', 'Você não pode inativar a própria conta enquanto estiver conectado.');
      return;
    }
    handleToggleAtivo(u);
  };

  const handleToggleAtivo = async (u) => {
    setTogglingId(u.id);
    try {
      await userService.toggleAtivo(u.id);
      showToast('success', `${u.name} agora está ${u.ativo ? 'inativo' : 'ativo'}.`);
      fetchUsuarios();
    } catch (err) {
      showToast('error', err.message ?? 'Erro ao atualizar status do usuário.');
    } finally {
      setTogglingId(null);
    }
  };

  // Filtragem
  const filtered = usuarios.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.matricula.toLowerCase().includes(q);
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <>
      {/* ── Barra de ações ──────────────────────────────────────────────── */}
      <div className="gu-toolbar">
        <div className="gu-toolbar__search">
          <i className="bi bi-search gu-toolbar__search-icon" />
          <input
            type="search"
            className="config-input gu-search-input"
            placeholder="Buscar por nome, e-mail ou matrícula…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar usuários"
          />
        </div>

        <select
          className="config-input config-select gu-role-filter"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          aria-label="Filtrar por perfil"
        >
          <option value="">Todos os perfis</option>
          {Object.entries(USER_ROLE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <button
          type="button"
          className="config-btn-save gu-btn-novo"
          onClick={() => { setEditingUser(null); setModalOpen(true); }}
        >
          <i className="bi bi-person-plus-fill me-2" />
          Novo Usuário
        </button>
      </div>

      {/* ── Tabela de usuários ───────────────────────────────────────────── */}
      <div className="mockup-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="gu-table-loading">
            <span className="gu-spinner gu-spinner--lg" />
            <p>Carregando usuários…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="gu-empty">
            <i className="bi bi-people gu-empty__icon" />
            <p className="gu-empty__text">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="gu-table-wrapper">
            <table className="gu-table" aria-label="Lista de usuários">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Matrícula</th>
                  <th className="gu-th-hide-sm">Departamento</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="gu-table__row">
                    {/* Nome + e-mail */}
                    <td>
                      <div className="gu-user-cell">
                        <div className="gu-avatar" aria-hidden="true">{u.initials}</div>
                        <div>
                          <div className="gu-user-name">{u.name}</div>
                          <div className="gu-user-email">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Matrícula */}
                    <td className="gu-td-muted">{u.matricula || '—'}</td>

                    {/* Departamento */}
                    <td className="gu-td-muted gu-th-hide-sm">{u.department || '—'}</td>

                    {/* Perfil */}
                    <td>
                      <span className={ROLE_BADGE_CLASS[u.role] ?? 'role-badge'}>
                        {USER_ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>

                    {/* Status (Ativo/Inativo) */}
                    <td>
                      <span className={`mockup-chip ${u.ativo ? 'mockup-chip--success' : 'mockup-chip--neutral'}`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td>
                      <div className="gu-actions">
                        <button
                          type="button"
                          className="gu-action-btn"
                          title={
                            String(u.id) === String(currentUser?.id)
                              ? 'Você não pode inativar a própria conta'
                              : u.ativo ? 'Desativar usuário' : 'Ativar usuário'
                          }
                          aria-label={u.ativo ? `Desativar ${u.name}` : `Ativar ${u.name}`}
                          onClick={() => handleToggleClick(u)}
                          disabled={togglingId === u.id || String(u.id) === String(currentUser?.id)}
                        >
                          <i className={`bi ${u.ativo ? 'bi-toggle-on text-success' : 'bi-toggle-off text-muted'}`} />
                        </button>
                        <button
                          type="button"
                          className="gu-action-btn gu-action-btn--edit"
                          title="Editar usuário"
                          aria-label={`Editar ${u.name}`}
                          onClick={() => { setEditingUser(u); setModalOpen(true); }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          type="button"
                          className="gu-action-btn gu-action-btn--delete"
                          title={String(u.id) === String(currentUser?.id) ? 'Você não pode excluir a própria conta' : 'Excluir usuário'}
                          aria-label={`Excluir ${u.name}`}
                          disabled={String(u.id) === String(currentUser?.id)}
                          onClick={() => handleDeleteClick(u)}
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rodapé da tabela */}
        {!loading && filtered.length > 0 && (
          <div className="gu-table-footer">
            {filtered.length} de {usuarios.length} usuário(s)
          </div>
        )}
      </div>

      {/* ── Zona de Upload CSV ───────────────────────────────────────────── */}
      <CsvUploadZone onImported={fetchUsuarios} showToast={showToast} />

      {/* ── Modais ───────────────────────────────────────────────────────── */}
      <UsuarioModal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchUsuarios}
        editingUser={editingUser}
        showToast={showToast}
      />

      <ConfirmDeleteModal
        user={deletingUser}
        onConfirm={handleDelete}
        onCancel={() => setDeletingUser(null)}
        loading={deleteLoading}
      />
    </>
  );
}

export default GestaoUsuarios;
