import './Input.css'

export function Input({ value, onInput, placeholder = '', type = 'text' }) {
    return (
        <input
            className="gh-input"
            type={type}
            value={value}
            onInput={onInput}
            placeholder={placeholder}
        />
    )
}
