import type {
  ReactNode,
} from "react";


type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  disabled?: boolean;
  className?: string;
};


export default function Modal({
  title,
  description,
  children,
  onClose,
  disabled = false,
  className = "",
}: Props) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget &&
          !disabled
        ) {
          onClose();
        }
      }}
    >
      <div
        className={`company-modal ${className}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h2>
              {title}
            </h2>

            {description && (
              <p>
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            disabled={disabled}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}