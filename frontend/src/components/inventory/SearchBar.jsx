import { Search, XCircle } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input input-bordered w-full pl-10 pr-10 focus:outline-none focus:ring-1 focus:ring-gray-400"
        autoComplete="off"
      />
      <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      {value && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-error"
          onClick={() => onChange('')}
          tabIndex={-1}
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
