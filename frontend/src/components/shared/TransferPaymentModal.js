import React, { useRef, useState } from 'react';
import { pagosService } from '../../services/api';
import './TransferPaymentModal.css';

const TransferPaymentModal = ({
  isOpen,
  onClose,
  establecimiento,
  reservaId,
  pagoTransferencia,
  onSuccess
}) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [comprobanteBase64, setComprobanteBase64] = useState('');
  const [comprobanteContentType, setComprobanteContentType] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const alias = pagoTransferencia?.alias || '';
  const cvuCbu = pagoTransferencia?.cvuCbu || '';
  const titular = pagoTransferencia?.titular || '';
  const hasComprobante = !!comprobanteBase64;

  const resetFile = () => {
    setFileName('');
    setComprobanteBase64('');
    setComprobanteContentType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setError('');
    resetFile();
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError('');
    if (!file) {
      resetFile();
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('El comprobante no puede superar los 5 MB');
      resetFile();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      setComprobanteBase64(base64);
      setComprobanteContentType(file.type || 'application/octet-stream');
      setFileName(file.name);
    };
    reader.onerror = () => {
      setError('No se pudo leer el archivo');
      resetFile();
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmar = async () => {
    if (!hasComprobante || !reservaId || !establecimiento) return;
    setError('');
    setSubmitting(true);
    try {
      await pagosService.confirmarTransferencia({
        establecimiento,
        reservaId,
        comprobanteBase64,
        comprobanteNombre: fileName,
        comprobanteContentType
      });
      resetFile();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo confirmar el pago');
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="transfer-pago-overlay" onClick={handleClose} role="presentation">
      <div
        className="transfer-pago-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-pago-title"
      >
        <h3 id="transfer-pago-title">Datos para transferir</h3>
        <p className="transfer-pago-hint">
          Transferí el monto del turno a esta cuenta y adjuntá el comprobante para confirmar el pago.
        </p>

        <dl className="transfer-pago-datos">
          <div>
            <dt>Alias</dt>
            <dd>
              <span>{alias || '—'}</span>
              {alias && (
                <button type="button" className="transfer-pago-copy" onClick={() => copyText(alias)}>
                  Copiar
                </button>
              )}
            </dd>
          </div>
          <div>
            <dt>CVU / CBU</dt>
            <dd>
              <span>{cvuCbu || '—'}</span>
              {cvuCbu && (
                <button type="button" className="transfer-pago-copy" onClick={() => copyText(cvuCbu)}>
                  Copiar
                </button>
              )}
            </dd>
          </div>
          <div>
            <dt>Titular</dt>
            <dd>
              <span>{titular || '—'}</span>
            </dd>
          </div>
        </dl>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
          className="transfer-pago-file-input"
          onChange={handleFileChange}
        />

        {fileName && (
          <p className="transfer-pago-filename">Comprobante: {fileName}</p>
        )}

        {error && <div className="transfer-pago-error">{error}</div>}

        <div className="transfer-pago-actions">
          <button
            type="button"
            className="btn btn-outline transfer-pago-adjuntar"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
          >
            {fileName ? 'Cambiar comprobante' : 'Adjuntar comprobante'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirmar}
            disabled={!hasComprobante || submitting}
          >
            {submitting ? 'Confirmando...' : 'Confirmar pago'}
          </button>
          <button
            type="button"
            className="transfer-pago-cancel"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferPaymentModal;
