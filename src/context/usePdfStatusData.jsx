import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';

const apiUrl = process.env.REACT_APP_BASE_API_URL;

/**
 * Custom hook to fetch PDF status counts for a specific program
 * @param {number} programId - The ID of the program to fetch status counts for
 * @returns {Object} - Status counts and loading state
 */
const useStatusCounts = (programId) => {
  const { keygenUser } = useUser();
  const [pdfStatusCounts, setPdfStatusCounts] = useState(null);
  const [loadingstatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatusCounts = useCallback(async () => {
    if (!programId) {
      setPdfStatusCounts(null);
      return;
    }

    setLoadingStatus(true);
    setError(null);

    try {
      const response = await axios.get(`${apiUrl}/PDFfile/GetStatusCount/${programId}`, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      });

      setPdfStatusCounts(response.data);
    } catch (err) {
      console.error('Error fetching PDF status counts:', err);
      setError(err.message || 'Failed to fetch status counts');
      setPdfStatusCounts(null);
    } finally {
      setLoadingStatus(false);
    }
  }, [programId, keygenUser]);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  return {
    pdfStatusCounts,
    loadingstatus,
    error,
    refetch: fetchStatusCounts
  };
};

export default useStatusCounts;
