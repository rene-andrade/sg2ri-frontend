import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { TIPO_ITEM, TIPO_ITEM_LABELS, STATUS_ITEM } from '../../utils/constants';

export function ItemForm({ onSubmit, onCancel, initialData = null, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    tipo: initialData?.tipo || TIPO_ITEM.LABORATORIO,
    capacidade: initialData?.capacidade || 30,
    localizacao: initialData?.localizacao || '',
    descricao: initialData?.descricao || '',
    status: initialData?.status || STATUS_ITEM.ATIVO,
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.nome.trim()) {
      setValidationError('O nome da instalação ou recurso é obrigatório.');
      return;
    }

    if (!formData.localizacao.trim()) {
      setValidationError('Informe a localização física (bloco/sala/andar).');
      return;
    }

    onSubmit({
      ...formData,
      capacidade: Number(formData.capacidade) || 1,
    });
  };

  return (
    <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
      {validationError && (
        <Alert
          variant="danger"
          className="py-2 small rounded-3 border-0"
          style={{ backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)' }}
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {validationError}
        </Alert>
      )}

      <Row className="g-4">
        <Col xs={12}>
          <Form.Group controlId="itemNome">
            <Form.Label className="config-label mb-2 d-block">
              Nome da Instalação / Recurso *
            </Form.Label>
            <Form.Control
              type="text"
              name="nome"
              placeholder="Ex: Laboratório de Inteligência Artificial & Robótica"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="itemTipo">
            <Form.Label className="config-label mb-2 d-block">
              Categoria *
            </Form.Label>
            <Form.Select name="tipo" value={formData.tipo} onChange={handleChange} required>
              {Object.entries(TIPO_ITEM).map(([key, value]) => (
                <option key={key} value={value}>
                  {TIPO_ITEM_LABELS[value] || value}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="itemStatus">
            <Form.Label className="config-label mb-2 d-block">
              Status Operacional *
            </Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange} required>
              <option value={STATUS_ITEM.ATIVO}>Ativo / Disponível</option>
              <option value={STATUS_ITEM.MANUTENCAO}>Em Manutenção Técnica</option>
              <option value={STATUS_ITEM.INATIVO}>Inativo / Desativado</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="itemCapacidade">
            <Form.Label className="config-label mb-2 d-block">
              Capacidade Máxima (Lugares) *
            </Form.Label>
            <Form.Control
              type="number"
              name="capacidade"
              min={1}
              value={formData.capacidade}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={6}>
          <Form.Group controlId="itemLocalizacao">
            <Form.Label className="config-label mb-2 d-block">
              Localização Física *
            </Form.Label>
            <Form.Control
              type="text"
              name="localizacao"
              placeholder="Ex: Bloco B - 2º Andar (Sala 204)"
              value={formData.localizacao}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Group controlId="itemDescricao">
            <Form.Label className="config-label mb-2 d-block">
              Especificações Técnicas & Recursos
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descricao"
              placeholder="Ex: 25 computadores com GPU dedicada, projetor laser, bancadas de solda e ar-condicionado."
              value={formData.descricao}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end align-items-center gap-3 pt-4 border-top" style={{ borderColor: 'var(--outline-variant-20)' }}>
        {onCancel && (
          <button
            type="button"
            className="btn-mockup-outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-mockup-primary"
        >
          {isSubmitting && <Spinner size="sm" animation="border" />}
          <i className="bi bi-check2"></i>
          <span>{initialData ? 'Atualizar Dados' : 'Cadastrar Instalação'}</span>
        </button>
      </div>
    </Form>
  );
}

export default ItemForm;
