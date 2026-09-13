import React from 'react';
import Container from 'react-bootstrap/Container';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="py-4 mt-auto text-secondary"
      style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--outline-variant-20)',
      }}
    >
      <Container fluid className="px-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 small">
          <span className="fw-bold text-dark mockup-heading">SG2RI</span>
          <span className="text-muted">&bull;</span>
          <span className="text-muted">&copy; {currentYear} Sistema de Gestão e Reserva de Instalações</span>
        </div>
        <div className="d-flex align-items-center gap-3 small text-muted">
          <span className="config-label">Versão 1.0</span>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
