import './Modal.css';
import { Button } from '../Button/Button.jsx';

export function Modal({ title, message, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <Button onClick={onConfirm}>Confirm</Button>
                    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}