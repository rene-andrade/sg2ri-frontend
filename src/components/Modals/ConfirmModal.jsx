import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

export function ConfirmModal({
  show,
  title = 'Confirmação',
  message,
  confirmText = 'Confirmar',
  confirmVariant = 'primary',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  children,
}) {
  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static" className="mockup-modal">
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fs-5 mockup-heading">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2 px-4">
        {message && <p className="text-secondary mb-3 small">{message}</p>}
        {children}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 pb-4 px-4 gap-2">
        <button
          type="button"
          className="btn-mockup-outline"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={
            confirmVariant === 'danger'
              ? 'btn btn-danger rounded-pill px-4 fw-semibold border-0'
              : 'btn-mockup-primary'
          }
          style={
            confirmVariant === 'danger'
              ? { backgroundColor: 'var(--on-error-container)', color: '#ffffff', minHeight: '44px' }
              : {}
          }
        >
          {loading && <Spinner size="sm" animation="border" className="me-2" />}
          <span>{confirmText}</span>
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
