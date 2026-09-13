import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import itemService from '../../services/itemService';
import ItemTable from '../../components/Tables/ItemTable';
import ItemForm from '../../components/Forms/ItemForm';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import DetailModal from '../../components/Modals/DetailModal';
import Loading from '../../components/Common/Loading';

export function GerenciarItens() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState(null);

  const fetchItens = useCallback(async () => {
    setLoading(true);
    try {
      const data = await itemService.getItens();
      setItens(data);
    } catch (err) {
      console.error(err);
      setAlertFeedback({ type: 'danger', message: 'Erro ao carregar a lista de itens.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItens();
  }, [fetchItens]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (editingItem) {
        await itemService.updateItem(editingItem.id, formData);
        setAlertFeedback({
          type: 'success',
          message: `Recurso "${formData.nome}" atualizado com sucesso!`,
        });
      } else {
        await itemService.createItem(formData);
        setAlertFeedback({
          type: 'success',
          message: `Nova instalação "${formData.nome}" incluída no catálogo!`,
        });
      }
      setShowModal(false);
      setEditingItem(null);
      fetchItens();
    } catch (err) {
      setAlertFeedback({
        type: 'danger',
        message: err.message || 'Falha ao salvar os dados do item.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      await itemService.deleteItem(itemToDelete.id);
      setAlertFeedback({
        type: 'info',
        message: `O recurso "${itemToDelete.nome}" foi removido do catálogo.`,
      });
      setItemToDelete(null);
      fetchItens();
    } catch (err) {
      setAlertFeedback({
        type: 'danger',
        message: err.message || 'Falha ao excluir o recurso.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner */}
      <div className="mockup-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
        <div>
          <span className="config-label text-muted d-block">Catálogo de Infraestrutura (RF01)</span>
          <h2 className="fw-bold text-dark mb-1">Gerenciamento de Instalações</h2>
          <p className="text-secondary small mb-0">
            Cadastre novos laboratórios, salas de aula, auditórios e equipamentos móveis.
          </p>
        </div>

        <button
          type="button"
          className="btn-mockup-primary"
          onClick={handleOpenCreate}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Cadastrar Instalação</span>
        </button>
      </div>

      {alertFeedback && (
        <Alert
          variant={alertFeedback.type}
          dismissible
          onClose={() => setAlertFeedback(null)}
          className="rounded-4 border-0 shadow-sm"
          style={
            alertFeedback.type === 'success'
              ? { backgroundColor: 'var(--success-container)', color: 'var(--on-success-container)' }
              : alertFeedback.type === 'danger'
              ? { backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)' }
              : { backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface)' }
          }
        >
          <i className="bi bi-info-circle-fill me-2"></i>
          {alertFeedback.message}
        </Alert>
      )}

      {loading ? (
        <Loading message="Carregando catálogo de espaços..." />
      ) : (
        <ItemTable
          itens={itens}
          onViewDetails={(item) => setSelectedItemDetail(item)}
          onEditItem={handleOpenEdit}
          onDeleteItem={(item) => setItemToDelete(item)}
        />
      )}

      {/* Modal de Criação / Edição com Glassmorphism */}
      <Modal
        show={showModal}
        onHide={() => !actionLoading && setShowModal(false)}
        centered
        size="lg"
        backdrop="static"
        className="mockup-modal"
      >
        <Modal.Header closeButton className="border-0 pb-2 pt-4 px-4">
          <Modal.Title className="fs-5 mockup-heading d-flex align-items-center gap-2">
            <span className="icon-box-blue" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>
              <i className="bi bi-pencil-square"></i>
            </span>
            <span>{editingItem ? 'Editar Recurso' : 'Cadastrar Novo Recurso'}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-2">
          <ItemForm
            initialData={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowModal(false)}
            isSubmitting={actionLoading}
          />
        </Modal.Body>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        show={!!itemToDelete}
        title="Excluir Item do Catálogo"
        message={`Confirma a remoção definitiva de "${itemToDelete?.nome}" (${itemToDelete?.localizacao})?`}
        confirmText="Excluir Definitivamente"
        confirmVariant="danger"
        cancelText="Voltar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
        loading={actionLoading}
      />

      {/* Modal de Detalhes do Item */}
      <DetailModal
        show={!!selectedItemDetail}
        onClose={() => setSelectedItemDetail(null)}
        data={selectedItemDetail}
        type="item"
      />
    </div>
  );
}

export default GerenciarItens;
