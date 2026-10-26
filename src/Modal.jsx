import { IoMdClose } from 'react-icons/io';

export const Modal = ({ title, closeLabel, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <span className="modal-title">{title}</span>
        <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label={closeLabel || 'Close'}>
          <IoMdClose size={28} />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);
