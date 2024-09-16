import { useState, useCallback } from 'react';
import axios from 'axios';
import { useUser } from 'src/context/UserContext';

const useStatusCounts = (selectedProgram) => {
  const { keygenUser } = useUser();
  const [pdfStatusCounts, setStatusCounts] = useState(null);
  const [loadingstatus, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_BASE_API_URL;

  const fetchStatusCounts = useCallback(async () => {
    if (!selectedProgram) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiUrl}/PDFfile/GetStatusCount/${selectedProgram}`, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      });

      setStatusCounts(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedProgram, keygenUser, apiUrl]);

  return { 
    pdfStatusCounts, 
    loadingstatus, 
    error, 
    refetch: fetchStatusCounts 
  };
};

export default useStatusCounts;
