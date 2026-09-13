import React, { useState, useMemo } from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { TIPO_ITEM, TIPO_ITEM_LABELS, STATUS_ITEM } from '../../utils/constants';

export function ItemTable({
  itens = [],
  onViewDetails,
  onEditItem,
  onDeleteItem,
  emptyMessage = 'Nenhuma instalação ou recurso cadastrado.',
}) {
  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItens = useMemo(() => {
    return itens.filter((item) => {
      const matchTipo = filterTipo === 'TODOS' || item.tipo === filterTipo;
      const matchStatus = filterStatus === 'TODOS' || item.status === filterStatus;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        item.nome?.toLowerCase().includes(term) ||
        item.localizacao?.toLowerCase().includes(term) ||
        item.descricao?.toLowerCase().includes(term);

      return matchTipo && matchStatus && matchSearch;
    });
  }, [itens, filterTipo, filterStatus, searchTerm]);

  const getStatusChip = (status) => {
    switch (status) {
      case STATUS_ITEM.ATIVO:
        return <span className="mockup-chip mockup-chip--success"><i className="bi bi-check-circle-fill"></i> Disponível</span>;
      case STATUS_ITEM.MANUTENCAO:
        return <span className="mockup-chip mockup-chip--warning"><i className="bi bi-tools"></i> Manutenção</span>;
      case STATUS_ITEM.INATIVO:
        return <span className="mockup-chip mockup-chip--neutral"><i className="bi bi-slash-circle"></i> Inativo</span>;
      default:
        return <span className="mockup-chip mockup-chip--neutral">{status}</span>;
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Barra de Filtros Inset */}
      <div
        className="p-3 rounded-4"
        style={{
          backgroundColor: 'var(--surface-container-low)',
        }}
      >
        <Row className="g-3 align-items-center">
          <Col xs={12} md={5}>
            <div className="position-relative">
              <i
                className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                style={{ fontSize: '0.85rem' }}
              ></i>
              <Form.Control
                type="text"
                placeholder="Buscar por nome, bloco ou especificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-5 py-2 bg-white"
                style={{
                  backgroundColor: '#ffffff !important',
                  borderRadius: '0.75rem',
                }}
              />
            </div>
          </Col>

          <Col xs={6} md={4}>
            <Form.Select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="py-2"
              style={{
                backgroundColor: '#ffffff !important',
                borderRadius: '0.75rem',
              }}
            >
              <option value="TODOS">Todas as Categorias</option>
              {Object.entries(TIPO_ITEM).map(([key, val]) => (
                <option key={key} value={val}>
                  {TIPO_ITEM_LABELS[val] || val}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={6} md={3} className="d-flex justify-content-md-end">
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-2"
              style={{
                backgroundColor: '#ffffff !important',
                borderRadius: '0.75rem',
              }}
            >
              <option value="TODOS">Todos os Status</option>
              <option value={STATUS_ITEM.ATIVO}>Disponíveis</option>
              <option value={STATUS_ITEM.MANUTENCAO}>Em Manutenção</option>
              <option value={STATUS_ITEM.INATIVO}>Inativos</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Tabela de Recursos */}
      <div className="mockup-card overflow-hidden">
        <div className="table-responsive">
          <Table hover className="gu-table align-middle mb-0 text-nowrap">
            <thead>
              <tr>
                <th className="ps-4">Código</th>
                <th>Instalação / Equipamento</th>
                <th>Categoria</th>
                <th>Capacidade</th>
                <th>Localização</th>
                <th>Status</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <div className="icon-box-blue mb-3 mx-auto" style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>
                      <i className="bi bi-box-seam"></i>
                    </div>
                    <div className="fw-semibold text-dark">{emptyMessage}</div>
                    <small className="text-muted">Nenhum recurso cadastrado nesta visualização.</small>
                  </td>
                </tr>
              ) : (
                filteredItens.map((item) => (
                  <tr key={item.id} className="gu-table__row">
                    <td className="ps-4 font-monospace small fw-bold text-muted">
                      #{item.id}
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{item.nome}</div>
                      <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '280px' }}>
                        {item.descricao || 'Sem especificações cadastradas.'}
                      </small>
                    </td>
                    <td>
                      <span className="config-label text-secondary">
                        {TIPO_ITEM_LABELS[item.tipo] || item.tipo}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold font-monospace">{item.capacidade}</span>{' '}
                      <small className="text-muted">lugares</small>
                    </td>
                    <td>
                      <span className="small text-secondary">{item.localizacao}</span>
                    </td>
                    <td>{getStatusChip(item.status)}</td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex align-items-center gap-2">
                        {onViewDetails && (
                          <button
                            type="button"
                            className="btn btn-sm btn-mockup-outline p-0 d-inline-flex align-items-center justify-content-center"
                            onClick={() => onViewDetails(item)}
                            title="Visualizar detalhes"
                            style={{ width: '34px', height: '34px', minHeight: '34px', borderRadius: '50rem' }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        )}
                        {onEditItem && (
                          <button
                            type="button"
                            className="btn btn-sm btn-mockup-outline p-0 d-inline-flex align-items-center justify-content-center"
                            onClick={() => onEditItem(item)}
                            title="Editar recurso"
                            style={{ width: '34px', height: '34px', minHeight: '34px', borderRadius: '50rem' }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        )}
                        {onDeleteItem && (
                          <button
                            type="button"
                            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center text-danger border-0"
                            onClick={() => onDeleteItem(item)}
                            title="Excluir recurso"
                            style={{
                              width: '34px',
                              height: '34px',
                              minHeight: '34px',
                              borderRadius: '50rem',
                              backgroundColor: 'var(--error-container)',
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default ItemTable;
