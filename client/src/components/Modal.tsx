import type { MouseEvent, ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  // Omit to make the modal non-dismissible (e.g. while a request is
  // still in flight) — there's then no backdrop-click handler at all.
  onClose?: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  function stopPropagation(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={stopPropagation}>
        {children}
      </div>
    </div>
  );
}
