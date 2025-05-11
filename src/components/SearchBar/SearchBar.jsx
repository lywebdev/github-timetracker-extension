import { useState } from 'preact/hooks';
import './SearchBar.css';

export function SearchBar({ onSearch }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onInput={handleChange}
            />
        </div>
    );
}