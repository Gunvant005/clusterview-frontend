import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HelpA.module.css';
import { FaArrowLeft, FaSort, FaTimes } from 'react-icons/fa';

const AdminHelp = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const [expandedQueries, setExpandedQueries] = useState({});

  // Move fetchQueries outside useEffect
  const fetchQueries = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/fetch-all-queries?email=Admin@gmail.com&password=123');
      const data = await response.json();
      if (response.ok) {
        if (Array.isArray(data)) {
          const queriesWithIndex = data.map((query, index) => ({ ...query, originalIndex: index }));
          setQueries(queriesWithIndex);
          setFilteredQueries(queriesWithIndex);
        } else {
          setError('Invalid data format received from server');
        }
      } else {
        setError(data.error || 'Failed to fetch queries');
      }
    } catch (err) {
      setError('Error connecting to the server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = queries.filter(query =>
      query.name && query.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredQueries(filtered);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredQueries(queries);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredQueries].sort((a, b) => {
      if (key === 'submittedAt') {
        const dateA = new Date(a[key] || 0);
        const dateB = new Date(b[key] || 0);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      const valueA = (a[key] || '').toString().toLowerCase();
      const valueB = (b[key] || '').toString().toLowerCase();
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredQueries(sorted);
  };

  const toggleExpand = (id) => {
    setExpandedQueries(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    fetchQueries(); // Now accessible
  };

  return (
    <div className={styles.adminHelpContainer}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate('/admin')}
          aria-label="Go back to admin dashboard"
        >
          <FaArrowLeft />
        </button>
        <h1>User Queries</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
            aria-label="Search queries by name"
          />
          {searchTerm && (
            <button
              className={styles.clearButton}
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {error ? (
          <div className={styles.errorContainer}>
            <p className={styles.error}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={retryFetch}
              aria-label="Retry fetching queries"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className={styles.loader}>Loading...</div>
        ) : filteredQueries.length === 0 ? (
          <p className={styles.noQueries}>No queries found.</p>
        ) : (
          <div className={styles.queryTableContainer}>
            <table className={styles.queryTable} role="grid">
              <thead>
                <tr>
                  <th scope="col">
                    <button onClick={() => handleSort('originalIndex')} className={styles.sortButton}>
                      Sr. No. <FaSort />
                    </button>
                  </th>
                  <th scope="col">
                    <button onClick={() => handleSort('name')} className={styles.sortButton}>
                      Name <FaSort />
                    </button>
                  </th>
                  <th scope="col">
                    <button onClick={() => handleSort('email')} className={styles.sortButton}>
                      Email <FaSort />
                    </button>
                  </th>
                  <th scope="col">Query</th>
                  <th scope="col">
                    <button onClick={() => handleSort('submittedAt')} className={styles.sortButton}>
                      Submitted At <FaSort />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.map((query) => (
                  <tr key={query._id || Math.random()}>
                    <td data-label="Sr. No.">{typeof query.originalIndex === 'number' ? query.originalIndex + 1 : 'N/A'}</td>
                    <td data-label="Name">{query.name || 'N/A'}</td>
                    <td data-label="Email">{query.email || 'N/A'}</td>
                    <td data-label="Query" className={styles.queryCell}>
                      <span className={expandedQueries[query._id] ? '' : styles.truncated}>
                        {query.query || 'N/A'}
                      </span>
                      {query.query && query.query.length > 50 && (
                        <button
                          className={styles.expandButton}
                          onClick={() => toggleExpand(query._id)}
                          aria-label={expandedQueries[query._id] ? 'Collapse query' : 'Expand query'}
                        >
                          {expandedQueries[query._id] ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </td>
                    <td data-label="Submitted At">
                      {query.submittedAt ? new Date(query.submittedAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        © 2025 ClusterView. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminHelp;