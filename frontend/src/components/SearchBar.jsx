export default function SearchBar({ searchTerm, onSearchTermChange, onSubmitSearch }) {
    const handleInputChange = (event) => {
        onSearchTermChange(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmitSearch();
    };

    return (
        <form className="search-bar control-card mb-6" onSubmit={handleSubmit}>
            <label htmlFor="global-search" style={{ fontWeight: 'bold' }}>
                Search Users
            </label>
            <div className="mt-2 flex gap-2">
                <input
                    id="global-search"
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2"
                />
                <button
                    type="submit"
                    className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                >
                    Search
                </button>
            </div>
        </form>
    );
}