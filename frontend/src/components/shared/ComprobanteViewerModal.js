import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './ComprobanteViewerModal.css';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

const ComprobanteViewerModal = ({ isOpen, onClose, comprobante }) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setZoom(1);
      return undefined;
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !comprobante?.src) return null;

  const isImage = String(comprobante.contentType || '').startsWith('image/');
  const title = comprobante.nombre || 'Comprobante de pago';

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, Number((z + ZOOM_STEP).toFixed(2))));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, Number((z - ZOOM_STEP).toFixed(2))));
  const zoomReset = () => setZoom(1);

  return createPortal(
    <div className="comprobante-viewer-overlay" onClick={onClose} role="presentation">
      <div
        className="comprobante-viewer-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comprobante-viewer-title"
      >
        <div className="comprobante-viewer-header">
          <h3 id="comprobante-viewer-title">{title}</h3>
          <div className="comprobante-viewer-zoom">
            <button type="button" onClick={zoomOut} disabled={zoom <= MIN_ZOOM} aria-label="Alejar">
              −
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={zoomIn} disabled={zoom >= MAX_ZOOM} aria-label="Acercar">
              +
            </button>
            <button type="button" className="comprobante-viewer-reset" onClick={zoomReset}>
              Restablecer
            </button>
          </div>
          <button type="button" className="comprobante-viewer-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="comprobante-viewer-body">
          <div
            className="comprobante-viewer-canvas"
            style={{ transform: `scale(${zoom})` }}
          >
            {isImage ? (
              <img src={comprobante.src} alt={title} />
            ) : (
              <iframe
                title={title}
                src={comprobante.src}
                className="comprobante-viewer-pdf"
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ComprobanteViewerModal;
