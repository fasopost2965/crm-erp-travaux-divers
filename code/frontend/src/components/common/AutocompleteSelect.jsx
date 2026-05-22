import React, { useState, useEffect, useRef } from 'react';

const AutocompleteSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Sélectionner une option...',
  noOptionsText = 'Aucun élément trouvé',
  disabled = false,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync search input with selected value label when dropdown closes/opens
  const selectedOption = options.find(opt => String(opt.value) === String(value));

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.value);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full font-sans">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
          disabled 
            ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            : error
              ? 'bg-red-50/20 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 focus:ring-red-500'
              : isOpen
                ? 'bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/10 text-slate-800 dark:text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-850/80 hover:border-slate-200 dark:hover:border-slate-800 text-slate-800 dark:text-slate-200'
        }`}
      >
        <span className="text-xs font-semibold truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-fadeIn max-h-60 flex flex-col">
          {/* Search bar inside popover */}
          <div className="p-2.5 border-b border-slate-50 dark:border-slate-850 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <input
              type="text"
              autoFocus
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto flex-1 py-1 divide-y divide-slate-50 dark:divide-slate-850">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 font-semibold text-center">
                {noOptionsText}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-black'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    {option.label}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteSelect;
