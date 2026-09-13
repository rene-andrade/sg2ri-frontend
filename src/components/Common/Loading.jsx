import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

export function Loading({ message = 'Carregando informações...', size = 'md', center = true }) {
  const content = (
    <div className={`d-flex flex-column align-items-center gap-2 ${center ? 'py-5' : 'py-2'}`}>
      <Spinner
        animation="border"
        variant="primary"
        role="status"
        style={{ width: size === 'lg' ? '3rem' : '2rem', height: size === 'lg' ? '3rem' : '2rem' }}
      >
        <span className="visually-hidden">Carregando...</span>
      </Spinner>
      {message && <span className="text-secondary small fw-medium">{message}</span>}
    </div>
  );

  return content;
}

export default Loading;
