const addProgram = async (programName) => {
    try {
      const response = await fetch(`${baseUrl}/api/Program`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${keygenUser?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ programName })
      });
      if (!response.ok) {
        throw new Error('Failed to add program');
      }
      const newProgram = await response.json();
      setPrograms([...programs, newProgram]);
      handleChange('programmeID', newProgram.programmeID);
    } catch (error) {
      console.error('Error adding program:', error);
    }
  };

  const addSubject = async (subjectName) => {
    try {
      const response = await fetch(`${baseUrl}/api/Subjects`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${keygenUser?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject_Name: subjectName })
      });
      if (!response.ok) {
        throw new Error('Failed to add subject');
      }
      const newSubject = await response.json();
      setSubjects([...subjects, newSubject]);
      handleChange('subjectID', newSubject.subject_Id);
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };
