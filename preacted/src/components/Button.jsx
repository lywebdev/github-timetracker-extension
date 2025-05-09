import './Button.css'

export function Button({ children, onClick, type = 'button', className = '' }) {
    return (
        <button type={type} className={`gh-btn ${className}`} onClick={onClick}>
            {children}
        </button>
    )
}
