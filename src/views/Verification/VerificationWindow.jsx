import React, { useState, useEffect, useRef } from 'react'
import Select from 'react-select'
import { Col, Row, Form, Button, Collapse, Badge } from 'react-bootstrap'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCheckCircle, faChevronDown, faChevronUp, faCompress, faExclamationCircle, faExpand, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { useUser } from 'src/context/UserContext'
import { ToastContainer, toast } from 'react-toastify'
import { FaCheckCircle } from 'react-icons/fa'
import useStatusCounts from 'src/context/usePdfStatusData'

const apiUrl = process.env.REACT_APP_BASE_API_URL
const apiBasaUrl = process.env.REACT_APP_BASE_URL

const VerificationWindow = () => {
  const { keygenUser } = useUser()
  const [programs, setPrograms] = useState([])
  const [catchNumbers, setCatchNumbers] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [selectedCatchNumber, setSelectedCatchNumber] = useState(null)
  const [showPdfs, setShowPdfs] = useState(false)
  const [pdfUrls, setPdfUrls] = useState([])
  const [persistedState, setPersistedState] = useState(() => {
    const saved = sessionStorage.getItem('verificationState')
    return saved ? JSON.parse(saved) : {
      selectedPages: [1, 1, 1, 1],
      currentPage: [0, 3]
    }
  })
  const [selectedPages, setSelectedPages] = useState(persistedState.selectedPages)
  const [iframeKey, setIframeKey] = useState(0)
  const [showFilters, setShowFilters] = useState(true)
  const [pagePattern, setPagePattern] = useState([])
  const iframesRef = useRef([])
  const fullscreenRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [papers, setPapers] = useState({})
  const [numPages, setNumPages] =useState(32)
  const [currentPage, setCurrentPage] = useState(persistedState.currentPage)
  const [verificationData, setVerificationData]= useState([])
  const [setOrders, setSetOrders]= useState([])
  const [showVerificationBtn, setShowVerificationBtn] = useState(false)
  const [showSrip, setShowStrip] = useState(true);
  const [masterAnswers, setMasterAnswers] = useState([]);
  const [progConfigId, setProgConfigId] = useState();
  const [jumblingConfig, setJumblingConfig] = useState();
  const [scanPages, setScanPages] = useState();
  const [jpbc, setJpbc] = useState([]);
  const [jpbcMapping, setJpbcMapping] = useState({});
  const [matchingStatus, setMatchingStatus] = useState([]);
  
  const [verificationStatus, setVerificationStatus]= useState([
    {seriesname: 1, status: 1}, // 1 for verified 0 for not verified

  ])
  const statusOptions = [
    { value: 'notverified', label: 'Not Verified' },
    { value: 'verified', label: 'Verified (Correct)' },
    { value: 'verifiedincorrect', label: 'Verified (Incorrect)' },
    { value: 'all', label: 'All' }
  ];
  const [selectedFilter, setSelectedFilter] = useState(null);
  const { pdfStatusCounts, loadingstatus, error, refetch } = useStatusCounts(selectedProgram?.value);
  const { notVerifiedCount = 0, totalCatchNumbers = 0, totalFiles = 0, totalPapers = 0, verifiedCount = 0, wrongCount = 0 } = pdfStatusCounts || {};


  useEffect(() => {
    handlePageClick()
  }, [])

  useEffect(() => {
    if (selectedProgram) {
      refetch();
    }
  }, [selectedProgram, refetch]);

  

  useEffect(() => {
    // Retrieve the selected filter from sessionStorage
    const storedFilter = sessionStorage.getItem('selectedFilter');
    if (storedFilter) {
      setSelectedFilter(JSON.parse(storedFilter));
    } else {
      // Default to "Not Verified" if no filter is stored
      const defaultOption = statusOptions.find(option => option.value === 'notverified');
      setSelectedFilter(defaultOption);
      sessionStorage.setItem('selectedFilter', JSON.stringify(defaultOption));
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      selectedPages,
      currentPage
    }
    sessionStorage.setItem('verificationState', JSON.stringify(stateToSave))
    console.log('State persisted:', stateToSave)
  }, [selectedPages, currentPage])

  useEffect(() => {
    const handleError = (error) => {
      console.error('State Update Error:', error)
      const saved = sessionStorage.getItem('verificationState')
      if (saved) {
        const { selectedPages: savedPages, currentPage: savedCurrent } = JSON.parse(saved)
        setSelectedPages(savedPages)
        setCurrentPage(savedCurrent)
      }
    }
  
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])


  const cleardata = ()=>{
    setShowPdfs(false)
    setPdfUrls([])
    // setSelectedPages([1, 1, 1, 1])
    setIframeKey(0)
    setIsFullscreen(false)
    setPagePattern([])
    setPapers({})
    setNumPages(32)
    // setCurrentPage([0,3])
    setShowFilters(true)
  }

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await axios.get(`${apiUrl}/Programmes`, {
          headers: { Authorization: `Bearer ${keygenUser?.token}` },
        })
        const programOptions = response.data.map((program) => ({
          value: program.programmeID,
          label: program.programmeName,
        }))
        setPrograms(programOptions)

        const storedProgram = sessionStorage.getItem('selectedProgram')
        if (storedProgram) {
          setSelectedProgram(JSON.parse(storedProgram))
        }
      } catch (error) {
        console.error('Error fetching programmes:', error)
      }
    }
    fetchPrograms()
  }, [keygenUser, apiUrl])


  // Fetch Cartch numbers 
  useEffect(() => {
    fetchCatchNumbers();
  }, [selectedProgram, selectedFilter, keygenUser, apiUrl]);

  const fetchMatchingStatus = async () => {
    if (selectedProgram && selectedCatchNumber) {
      try {
        const response = await axios.get(
          `${apiUrl}/FormData/GetMatchingStatus?CatchNumber=${selectedCatchNumber.value}&ProgramId=${selectedProgram.value}`,
          {
            headers: { Authorization: `Bearer ${keygenUser?.token}` },
          }
        );
        setMatchingStatus(response?.data?.matches);

      } catch (error) {
        console.error('Error fetching matching status:', error);
        setMatchingStatus([]);
      }
    }
  };

  useEffect(() => {
    fetchMatchingStatus();
  }, [selectedProgram, selectedCatchNumber]);

  const fetchCatchNumbers = async () => {
    if (selectedProgram && selectedFilter) {
      try {
        const response = await axios.get(
          `${apiUrl}/PDFfile/catch-numbers?programId=${selectedProgram.value}&statusFilter=${selectedFilter.value}`,
          {
            headers: { Authorization: `Bearer ${keygenUser?.token}` },
          }
        );
        const catchNumberOptions = response.data.map((catchNumber) => ({
          value: catchNumber.catchNumber,
          label: `${catchNumber.catchNumber}`,
        }));
        setCatchNumbers(catchNumberOptions);
      } catch (error) {
        console.error('Error fetching catch numbers:', error);
      }
    }
  };

  useEffect(() => {
    if (selectedProgram && selectedCatchNumber) {
      async function fetchPapers() {
        try {
          const response = await axios.get(
            `${apiUrl}/Papers/ByProgramAndCatchNumber/${selectedProgram.value}/${selectedCatchNumber.value}`,
            {
              headers: { Authorization: `Bearer ${keygenUser?.token}` },
            },
          )
          const paperData = response.data[0]
          setPapers(paperData)
          setNumPages(paperData.bookletSize)
        } catch (error) {
          console.error('Error fetching papers:', error)
          setPapers({})
        }
      }
      fetchPapers()
    }
  }, [selectedProgram, selectedCatchNumber, apiUrl, keygenUser])

  useEffect(()=>{
    if (selectedProgram && selectedCatchNumber && papers) {
      fetchJpbc()
    }
  },[selectedProgram,selectedCatchNumber,papers])

  const fetchJpbc = async ()=>{
    try{
      const response = await axios.get(`${apiUrl}/FormData/GetJumblingPatternByConfig?ProgramId=${selectedProgram.value}&BookletSize=${papers.bookletSize}`,{
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      })
      const jpbcData = response?.data;
      setJpbc(jpbcData)
    }
    catch (error) {
      console.error('Error fetching papers:', error)
    }
  }

  useEffect(() => {
    if (jpbc && jpbc.length > 0) {
      const mapping = jpbc.reduce((acc, item) => {
        acc[item.id] = {
          A: item.setA,
          B: item.setB,
          C: item.setC,
          D: item.setD
        };
        return acc;
      }, {});
      setJpbcMapping(mapping);
    }
  }, [jpbc]);

  const updateSelectedPages = (questionNumber) => {
    if (Object.keys(jpbcMapping).length > 0 && questionNumber) {
      const pageSet = jpbcMapping[questionNumber];
      if (pageSet) {
        const newSelectedPages = [pageSet.A, pageSet.B, pageSet.C, pageSet.D];
        setSelectedPages(newSelectedPages);
        setIframeKey((prevKey) => prevKey + 1);
      }
    }
  };

  

  useEffect(() => {
    if (selectedProgram && papers) {
      async function fetchorders() {
        try {
          const response = await axios.get(
            `${apiUrl}/ProgConfigs/Programme/${selectedProgram.value}/${papers.bookletSize}`,
            {
              headers: { Authorization: `Bearer ${keygenUser?.token}` },
            },
          )
          const paperData = response?.data[0];
          setProgConfigId(paperData?.progConfigID)
          // Split the setOrder string by commas to create an array
          const setOrderArray = paperData.setOrder.split(',');
          
          // Set the orders using the transformed array
          setSetOrders(setOrderArray);
          
        } catch (error) {
          console.error('Error fetching papers:', error)
          setSetOrders({})
        }
      }
      fetchorders()
    }
  }, [papers])


  // fetch jubling steps 
  useEffect(() => {
    if (progConfigId) {
      const FetchJublingSteps = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}/ProgConfigs/${progConfigId}`,
            {
              headers: { Authorization: `Bearer ${keygenUser?.token}` },
            },
          );
          setJumblingConfig(response.data?.steps)
        } catch (error) {
          console.error('Error fetching papers:', error);
          
        }
      };
      FetchJublingSteps();
    }
  }, [progConfigId]);


useEffect(() => {
  if (jumblingConfig && selectedCatchNumber) {
    const GetPageDataByScanPdf = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/PDFfile/GetExtractedData?programId=${selectedProgram.value}&catchNumber=${selectedCatchNumber.value}&series=${setOrders[0]}`, // Adjust endpoint as necessary
          {
            headers: { Authorization: `Bearer ${keygenUser?.token}` },
          }
        );
        setScanPages(response.data)
      } catch (error) {
        console.error('Error fetching jumbling steps:', error);
      }
    };
    
    GetPageDataByScanPdf();
  }
}, [jumblingConfig, selectedProgram , selectedCatchNumber]);


  // Get answers by page number 

   
    const fetchAnswersByPage = async ()=> {
         if (selectedCatchNumber && currentPage && selectedProgram ) {
        try {
          console.log(currentPage)
          const response = await axios.get(`${apiUrl}/PDFfile/GetAnswersbyPage`, {
            params: {
              CatchNumber: selectedCatchNumber?.value,
              PageNumber: currentPage[1],
              ProgramId: selectedProgram?.value,
              SetId: currentPage[0]+1, // Assuming setOrders are 1-based
            },
            headers: { Authorization: `Bearer ${keygenUser?.token}` },
          });
  
          // Process the response here
          const answersData = response.data;
          setMasterAnswers(response.data)
          // Update your state or perform any action with answersData
  
        } catch (error) {
          console.error('Error fetching answers by page:', error);
        }
      }
      
    }


    // filter change state handle  
    const handleFilterChange = (selectedOption) => {
      setSelectedFilter(selectedOption);
      setSelectedCatchNumber([])
      setShowPdfs(false)
      // Save the selected filter to sessionStorage
      sessionStorage.setItem('selectedFilter', JSON.stringify(selectedOption));
    };
    
  async function fetchPagePattern() {
    if (selectedProgram && selectedCatchNumber && papers){
      try {
      const response = await axios.post(`${apiUrl}/FormData/GetPatternbyLine`, null, {
        params: {
          bookletsize: papers.bookletSize,
          CatchNumber: selectedCatchNumber.value,
          progId: selectedProgram.value,
        },
      })
      const pagePatternData = response.data
      const groupedData = pagePatternData.reduce((acc, item) => {
        const { questionNumber, setID, pageNumber } = item
        if (!acc[questionNumber - 1]) {
          acc[questionNumber - 1] = {}
        }
        if (pageNumber !== null && pageNumber !== undefined) {
          acc[questionNumber - 1][setID] = pageNumber
        }
        return acc
      }, [])
      const cleanedGroupedData = groupedData.filter((item) => Object.keys(item).length > 0)
      setPagePattern(cleanedGroupedData)
    } catch (error) {
      toast.error('No Pattern Found.')
      console.error('Error fetching page pattern:', error)
    }
    } 
  }
  

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     iframesRef.current.forEach((iframe, index) => {
  //       if (iframe && iframe.contentDocument) {
  //         const iframeDocument = iframe.contentDocument;
  //         const scrollTop = iframeDocument.documentElement.scrollTop;
  //         const pageHeight = iframeDocument.documentElement.scrollHeight / 32;
  //         const currentPage = Math.ceil(scrollTop / pageHeight);
  //         console.log(currentPage)
  
  //         // Update only if the current page is different from the selected page
  //         if (currentPage !== selectedPages[index]) {
  //           setSelectedPages((prevPages) => {
  //             const updatedPages = [...prevPages];
  //             updatedPages[index] = currentPage;
  //             console.log(updatedPages)
  //             return updatedPages;
  //           });
  //         }
  //       }
  //     });
  //   }, 1000);
  
  //   return () => clearInterval(intervalId);
  // }, [selectedPages, iframesRef]);

  const fetchPdfs = async () => {
    if (selectedProgram && selectedCatchNumber) {
      // fetchPagePattern()
      try {
        const url = `${apiUrl}/PDFfile/GetPdfs?CatchNumber=${selectedCatchNumber.value}&ProgramId=${selectedProgram.value}`
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${keygenUser?.token}` },
        })
        const pdfData = response.data
        const pdfUrls = pdfData.map((pdf) => `${apiBasaUrl}/CatchPdfs/${pdf.fileName}`)
        setPdfUrls(pdfUrls)
      } catch (error) {
        toast.error('Error fetching PDFs:', error)
        setPdfUrls([])
      }
    }
  }
  
  const fetchVerificationData = async ()=> {
    if (selectedProgram && selectedCatchNumber) {
      try {
        const url = `${apiUrl}/PDFfile/pageVerificationStatus?CatchNumber=${selectedCatchNumber.value}&ProgramId=${selectedProgram.value}`
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${keygenUser?.token}` },
        })
        setVerificationData(response.data)
      } catch (error) {
        toast.error('Error fetching PDFs:', error)
        setVerificationData([])
      }
    }
  }
  
  // const handleVerification = async (isCorrect) => {
  //   if (pdfUrls.length === 0) {
  //     toast.error("No PDFs to verify.")
  //     return
  //   }
  //   if (JSON.stringify(selectedPages) === JSON.stringify([1, 1, 1, 1])) {
  //     return;
  //   }
  
  //   const verificationPromises = pdfUrls.map((_, index) => {
  //     const requestBody = {
  //       id: 0,
  //       catchNumber: selectedCatchNumber.value,
  //       programId: selectedProgram.value,
  //       pageNumber: selectedPages[index],
  //       isCorrect: isCorrect,
  //       verifiedBy: keygenUser.userID,
  //       seriesName: setOrders ? setOrders[index] : null,
  //       verifiedAt: new Date().toISOString(),
  //     }
  
  //     return axios.post(`${apiUrl}/PDFfile/VerifyPageNumber`, requestBody, {
  //       headers: { Authorization: `Bearer ${keygenUser?.token}` },
  //     })
  //   })
  
  //   try {
  //     await Promise.all(verificationPromises)
      
  //     // Update the current page based on the first PDF (index 0)
  //     const currentPageNumber = selectedPages[0]
  //     console.log(currentPageNumber)
  //     const nextPage = currentPageNumber + 1
  //     console.log(nextPage)
  //     if (nextPage <= numPages - 2) {
  //       setSelectedPages(prevPages => {
  //         const newPages = [...prevPages]
  //         newPages[0] = nextPage
  //         // Only update other pages if jpbcMapping for nextPage exists
  //         if (jpbcMapping[nextPage]) {
  //           newPages[1] = jpbcMapping[nextPage].B || prevPages[1]
  //           newPages[2] = jpbcMapping[nextPage].C || prevPages[2]
  //           newPages[3] = jpbcMapping[nextPage].D || prevPages[3]
  //         }
  //         return newPages
  //       })
  //       setCurrentPage([0, nextPage])
  //     } else {
  //       toast.info("Reached the end of pages for this catch number.")
  //     }
  
  //     await handleShowPdfs()
  //   } catch (error) {
  //     toast.error('Error submitting verification for some pages.')
  //     console.error('Error submitting verification:', error)
  //   }
  // }

  const handleVerification = async (isCorrect) => {
    if (pdfUrls.length === 0) {
      toast.error("No PDFs to verify.")
      return
    }
    if (JSON.stringify(selectedPages) === JSON.stringify([1, 1, 1, 1])) {
      return;
    }
  
    const verificationPromises = pdfUrls.map((_, index) => {
      const requestBody = {
        id: 0,
        catchNumber: selectedCatchNumber.value,
        programId: selectedProgram.value,
        pageNumber: selectedPages[index],
        isCorrect: isCorrect,
        verifiedBy: keygenUser.userID,
        seriesName: setOrders ? setOrders[index] : null,
        verifiedAt: new Date().toISOString(),
      }
  
      return axios.post(`${apiUrl}/PDFfile/VerifyPageNumber`, requestBody, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      })
    })
  
    try {
      await Promise.all(verificationPromises)
      
      setSelectedPages(prevPages => {
        const newPages = [...prevPages]
        const nextPage = newPages[0] + 1
        
        if (nextPage > numPages - 2) {
          toast.info("Reached the end of pages for this catch number.")
          return prevPages
        }
  
        newPages[0] = nextPage
        if (jpbcMapping[nextPage]) {
          newPages[1] = jpbcMapping[nextPage].B || prevPages[1]
          newPages[2] = jpbcMapping[nextPage].C || prevPages[2]
          newPages[3] = jpbcMapping[nextPage].D || prevPages[3]
        }
        
        console.log('Updating selectedPages to:', newPages)
        return newPages
      })
  
      setCurrentPage(prev => {
        const nextPage = prev[1] + 1
        if (nextPage > numPages - 2) return prev
        
        console.log('Updating currentPage to:', [prev[0], nextPage])
        return [prev[0], nextPage]
      })
  
      await handleShowPdfs()
    } catch (error) {
      console.error('Error submitting verification:', error)
      toast.error('Error submitting verification for some pages.')
    }
  }

  useEffect(() => {
    fetchAnswersByPage();
  }, [currentPage]);
  

  const handleSingleVerification = async (isCorrect, pageIndex) => {
    if (!pdfUrls[pageIndex]) {
      toast.error("No PDF to verify for the selected page.")
      return
    }
  
    const requestBody = {
      id: 0, // Replace with actual ID if available
      catchNumber: selectedCatchNumber.value,
      programId: selectedProgram.value,
      pageNumber: selectedPages[pageIndex], // Current page number for the selected PDF
      isCorrect: isCorrect, // true for Verified, false for Wrong
      verifiedBy: keygenUser.userID, // Assuming you have the verifier's ID
      seriesName: setOrders ? setOrders[pageIndex] : null, // Assuming this is available from papers
      verifiedAt: new Date().toISOString(),
    }
  
    try {
      await axios.post(`${apiUrl}/PDFfile/VerifyPageNumber`, requestBody, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      })
  
      // If successful, proceed with handling the next page or show feedback
      // toast.success(`Page ${selectedPages[pageIndex]} has been ${isCorrect ? 'Verified' : 'Marked as Wrong'}.`)
      
      // Optionally update current page and refresh the PDFs if needed
      handleShowPdfs()
  
    } catch (error) {
      toast.error('Error submitting verification for the selected page.')
      console.error('Error submitting verification:', error)
    }
  }

  const markVerified = async (status) => {
    // Check if there are any PDFs to verify
    if (pdfUrls.length === 0) {
      toast.error("No PDFs to verify.");
      return;
    }
  
    // Check if selected pages are all default
    if (JSON.stringify(selectedPages) === JSON.stringify([1, 1, 1])) {
      return;
    }
  
    // Prepare and send verification requests
    const verificationPromises = verificationStatus.map((verification) => {
      const {  seriesName } = verification; // Extract additional data for each PDF
      
      // Construct the requestBody ensuring no circular references
      const requestBody = {
        status: status, // true for Verified, false for Wrong
        programId: selectedProgram.value,
        catchNumber: selectedCatchNumber.value,
        seriesName: seriesName,
      };
  
      return axios.post(`${apiUrl}/PDFfile/UpdateStatus`, requestBody, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      });
    });
  
    try {
      // Wait for all verification requests to complete
      await Promise.all(verificationPromises);
      toast.success(`All pages have been ${status === 1 ? 'Verified' : 'Marked as Wrong'}.`);
    } catch (error) {
      // Handle any errors during verification
      toast.error('Error submitting verification for some pages.');
      console.error('Error submitting verification:', error);
    } finally {
      // Update current page and refresh PDFs
      setCurrentPage((currentPage) => [currentPage[0], currentPage[1] + 1]);
      setShowPdfs(false)
      refetch()
      setSelectedCatchNumber([])
      fetchCatchNumbers()
    }
  };
  
  
  
    useEffect(()=>{
      checkAllPdfVerified()
    },[verificationData])


    function checkAllPdfVerified() {
      // Create a map to track verification status for each catchNumber
      const catchNumberMap = new Map();
    
      // Log the incoming data for debugging
    
      verificationData.forEach(pdf => {
        const { seriesName, isCorrect, pageNumber } = pdf;
    
        // Debug log to check incoming data
    
        // Check if catchNumber and seriesName are defined
        if (selectedCatchNumber.value === undefined || seriesName === undefined) {
          console.error('Error: Undefined catchNumber or seriesName', {  seriesName });
          return;
        }
    
        // Initialize the map entry if it doesn't exist
        if (!catchNumberMap.has(selectedCatchNumber.value)) {
          catchNumberMap.set(selectedCatchNumber.value, {
            seriesStatus: new Map(),
            validPages: new Map(),
            allCorrect: true
          });
        }
    
        const catchData = catchNumberMap.get(selectedCatchNumber.value);
    
        // Initialize series status and valid pages set if not present
        if (!catchData.seriesStatus.has(seriesName)) {
          catchData.seriesStatus.set(seriesName, true);
          catchData.validPages.set(seriesName, new Set());
        }
    
        const validPageSet = catchData.validPages.get(seriesName);
    
        // Track valid pages in the series
        if (pageNumber >= 3 && pageNumber <= (numPages - 2)) {
          validPageSet.add(pageNumber);
    
          // Debug log to verify correct page addition
    
          // Update overall correctness
          if (!isCorrect) {
            catchData.seriesStatus.set(seriesName, false);
            catchData.allCorrect = false;
          }
        } else {
          // Pages outside the valid range affect series verification
          if (!isCorrect) {
            catchData.seriesStatus.set(seriesName, false);
            catchData.allCorrect = false;
          }
        }
      });
    
      // Update verificationStatus state based on results
      const finalVerificationStatus = new Map();
    
      catchNumberMap.forEach((data, catchNumber) => {
        data.seriesStatus.forEach((isVerified, seriesName) => {
          const validPageSet = data.validPages.get(seriesName);
          const numPages = Math.max(...Array.from(validPageSet), 0); // Default to 0 if no valid pages
    
          // Check if all valid pages are accounted for
          const expectedPages = new Set(Array.from({ length: numPages - 4 }, (_, i) => i + 3)); // Pages 3 to numPages-2
          const missingPages = Array.from(expectedPages).filter(page => !validPageSet.has(page));
    
          // Determine final status for the series
          if (missingPages.length > 0 || !isVerified) {
            finalVerificationStatus.set(`${catchNumber}-${seriesName}`, 0); // 0 for not verified
          } else {
            finalVerificationStatus.set(`${catchNumber}-${seriesName}`, 1); // 1 for verified
          }
        });
      });
    
      // Convert finalVerificationStatus map to an array
      const updatedVerificationStatus = Array.from(finalVerificationStatus, ([seriesKey, status]) => ({ seriesKey, status }));
    
      // Debug log to verify final verification status
    
      // Update state with verification status
      setVerificationStatus(updatedVerificationStatus);
      setShowVerificationBtn(Array.from(finalVerificationStatus.values()).every(status => status === 1));
    }
    

  const handleProgramChange = (selectedOption) => {
    setSelectedProgram(selectedOption)
    setSelectedCatchNumber(null)
    cleardata()
    setIframeKey((prevKey) => prevKey + 1)
    sessionStorage.setItem('selectedProgram', JSON.stringify(selectedOption))
  }

  const handleCatchNumberChange = async (selectedOption) => {
    setSelectedCatchNumber(selectedOption);
    cleardata();
    setIframeKey((prevKey) => prevKey + 1);
    const fetchMatchingStatus = async (catchNumber, programId) => {
      try {
        const response = await axios.get(
          `${apiUrl}/FormData/GetMatchingStatus?CatchNumber=${catchNumber}&ProgramId=${programId}`,
          {
            headers: { Authorization: `Bearer ${keygenUser?.token}` },
          }
        );
        setMatchingStatus(response?.data?.matches);
      } catch (error) {
        console.error('Error fetching matching status:', error);
        setMatchingStatus([]);
      }
    };
    const postjumblingpattern = async (catchNumber, programId) => {
    try {
      const response = await axios.post(`${apiUrl}/PdfData/MakeJumblingPattern?CatchNumber=${catchNumber}&ProgramId=${programId}`);
    } catch (error) {
      console.error('Error posting jumbling pattern:', error);
    }
  };
    if (selectedOption && selectedProgram) {
      await postjumblingpattern(selectedOption.value, selectedProgram.value);
      await fetchMatchingStatus(selectedOption.value, selectedProgram.value);
    }
  };

  const handleShowPdfs = async () => {
   await fetchPdfs()
   await fetchVerificationData()
    setShowPdfs(true)
    setShowFilters(false)
  }

  useEffect(() => {
    if (currentPage) {
      fetchAnswersByPage();
      const [pdfIndex, pageNumber] = currentPage;
      const questionNumber = Object.keys(jpbcMapping).find(key => 
        jpbcMapping[key][['A', 'B', 'C', 'D'][pdfIndex]] === pageNumber
      );
      if (questionNumber) {
        updateSelectedPages(parseInt(questionNumber));
      }
    }
  }, [currentPage]);

  const handlePageClick = (pdfIndex, pageNumber) => {
    setCurrentPage([pdfIndex, pageNumber]);
    console.log(pdfIndex, pageNumber)
  };

    const handleverificationreview = ()=>{
        setCurrentPage(currentPage => [currentPage[0], currentPage[1] + 1])
        handleShowPdfs()
    }

  const toggleFullscreen = () => {
    if (!fullscreenRef.current) {
      console.error('The ref is not attached to any element.')
      return
    }

    if (!document.fullscreenElement) {
      fullscreenRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => {
          console.error('Error attempting to enable fullscreen mode:', err)
          alert('Error attempting to enter fullscreen mode. Please try again.')
        })
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => {
          console.error('Error attempting to exit fullscreen mode:', err)
          alert('Error attempting to exit fullscreen mode. Please try again.')
        })
    }
  }

  const getStatus = (pdfIndex, pageNumber) => {
  
    // Find the seriesName based on pdfIndex (replace with your actual logic)
    const seriesName = setOrders[pdfIndex]; 
  
    // Filter the status data based on seriesName and pageNumber
    const status = verificationData.find(
      (item) =>
        item.seriesName === seriesName && item.pageNumber === pageNumber
    );
  
    return status ? status.isCorrect : null; // Return the 'isCorrect' status or null if not found
  };
  

  const getStatusColor = (status) => {
    if (status === true) return 'success';
    if (status === false) return 'danger';
    return 'outline-primary';
  };
  

  const extractFirstQuestionNumber = (pageNumber) => {
    const pageData = scanPages?.find(page => page.pageNumber === pageNumber);
    const qus = pageData ? pageData.firstQuestionNumber : null;
    return qus
  };
  useEffect(() => {
    return () => {
      // Cleanup function
      console.log('Component unmounting, cleaning up...')
      // Uncomment the following line if you want to clear persisted state on unmount
      // sessionStorage.removeItem('verificationState')
    }
  }, [])


  const isTextDanger = masterAnswers[0]?.questionNumber > 0 && 
                     extractFirstQuestionNumber(currentPage[1]) > 0 &&
                     masterAnswers[0]?.questionNumber !== extractFirstQuestionNumber(currentPage[1]);


                     
  return (
    <div className="verification-window">
      <ToastContainer />
      <div className="d-flex justify-content-between">
        <div>
          <Button variant="link" onClick={() => setShowFilters((prev) => !prev)} >
            <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} />
          </Button>
          <Button variant="link" onClick={toggleFullscreen}>
            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} /> 
          </Button>
        </div>
        <div>
              <Badge bg="secondary" className='p-2'>Total Catches: {totalPapers}</Badge>
              <Badge bg="info" className="p-2 ms-2">Not Uploaded: {totalPapers - totalCatchNumbers}</Badge>
              <Badge bg="primary" className="p-2 ms-2">Uploaded: {totalCatchNumbers}</Badge>
              <Badge bg="warning" className="p-2 ms-2">Not Verified: {notVerifiedCount}</Badge>
              <Badge bg="success" className="p-2 ms-2">Verified: {verifiedCount}</Badge>
              <Badge bg="danger" className="p-2 ms-2">Incorrect: {wrongCount}</Badge>
              </div>
        <div className="d-flex align-items-center justify-content-end gap-1"> 
        {
          !showVerificationBtn && (
            <div className="verifiedbtn">
                <Button size='sm' variant='danger' className='text-white' onClick={()=>markVerified(2)}>
                  Mark as Wrong
                </Button>
            </div>
          )
        }
            
         {/* mark as verified btn  */}
         {
            showVerificationBtn && pdfUrls && verificationData.length>0 && (
              <div className="verifiedbtn">
                <Button size='sm' variant='primary' onClick={()=>markVerified(1)}>
                  Mark as Verified
                </Button>
                </div>
            )
          }
          {/* Success Mark (Green) */}
          <Button variant="outline-success" size='sm' onClick={() => handleVerification(true)}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </Button>

          {/* Wrong Mark (Red) */}
          <Button variant="outline-danger" size='sm' onClick={() => handleVerification(false)}>
            <FontAwesomeIcon icon={faTimesCircle} />
          </Button>

          {/* Mark for Review (Yellow/Orange) */}
          <Button variant="outline-warning" size='sm' onClick={() => handleverificationreview()}>
            <FontAwesomeIcon icon={faExclamationCircle} />
          </Button>
          
        </div>
      </div>

      <Collapse in={showFilters}>
        <div>
          <Form>
            <Row className="mb-3">
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Program</Form.Label>
                  <Select
                    value={selectedProgram}
                    onChange={handleProgramChange}
                    options={programs}
                    placeholder="Select Program"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Select Filter:</Form.Label>
                  <Select
                    id="filter-dropdown"
                    value={selectedFilter}
                    onChange={handleFilterChange}
                    options={statusOptions}
                    placeholder="-- Select a Status --"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Catch Number</Form.Label>
                  <Select
                    value={selectedCatchNumber}
                    onChange={handleCatchNumberChange}
                    options={catchNumbers}
                    placeholder="Select Catch Number"
                    isDisabled={!selectedProgram}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className='mt-4'>
                <Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleShowPdfs}
                    disabled={!selectedCatchNumber}
                  >
                    Show PDFs
                  </Button>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>
      </Collapse>

      <Row className="g-2">
        {showPdfs && (
          <div ref={fullscreenRef}>
            <Row>
              
            {pdfUrls.map((url, pdfIndex) => (
        <Col md={6} className="mt-3 border border-2 p-3" key={pdfIndex}>
          <div className="mb-2 d-flex align-items-center justify-content-between">
            <div className="pagination-container">
              {Array.from({ length: numPages - 4 }, (_, i) => i + 3).map((pageNum) => {
                const status = getStatus(pdfIndex, pageNum);
                const isSelected = selectedPages[pdfIndex] === pageNum;
                const matchingStatusItem = matchingStatus.find(item => item.setA === pageNum);
                const verificationItem = verificationData.find(item => 
                  item.seriesName === setOrders[pdfIndex] && item.pageNumber === pageNum
                );

                const statusColors = {
                  default: '',
                  warning: 'warning',
                  success: 'success',
                  danger: 'danger'
                };

                let buttonStatus = 'default';
                if (matchingStatusItem && !matchingStatusItem.matchStatus && pdfIndex === 0) {
                  buttonStatus = 'warning';
                }
                if (verificationItem) {
                  buttonStatus = verificationItem.isCorrect ? 'success' : 'danger';
                }

                return (
                  <Button
                    key={pageNum}
                    variant={isSelected ? 'primary' : statusColors[buttonStatus] || getStatusColor(status)}
                    onClick={() => handlePageClick(pdfIndex, pageNum)}
                    className={`rounded-circle fw-bold btns ${isSelected ? `text-${getStatusColor(status)}` : ''}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
                    </div>
                      <div className="btn">
                        <div className="d-flex align-items-center justify-content-end gap-1"> 
                            {/* Success Mark (Green) */}
                            <Button variant="outline-success" size='sm' onClick={() => handleSingleVerification(true,pdfIndex)}>
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </Button>

                            {/* Wrong Mark (Red) */}
                            <Button variant="outline-danger" size='sm' onClick={() => handleSingleVerification(false,pdfIndex)}>
                              <FontAwesomeIcon icon={faTimesCircle} />
                            </Button>
                          </div>
                      </div>
                  </div>

                    <div style={{ position: 'relative' }}>
                      { showPdfs && (
                         <>
                          <div style={{
                            position: 'absolute',
                            top: 58,
                            left: 0,
                            width: '100%',
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            borderBottom: '1px solid #ddd',
                          }}>
                            <div className={`d-flex align-items-center fw-bold p-1 justify-content-around`}>
                                <span>
                              <strong className='text-center'>{selectedCatchNumber.value}-{setOrders[pdfIndex]}</strong>
                            </span>
                            {
                              pdfIndex === 0 && masterAnswers.length>0 ? (
                                <span className={isTextDanger ? 'text-danger' : ''}>&nbsp;
                                  <strong className='text-center'>Keys: </strong>
                                  {
                                    masterAnswers.map((key,index)=>(
                                      <span key={index} style={{ letterSpacing: '1px' }} className='text-center'>{key.questionNumber}:{key.answer}{masterAnswers.length-1 > index ?',':''} </span>
                                    ))
                                  }
                                  <span></span>
                                </span>
                              ):(
                                <span className='text-center'></span>
                              )
                            }
                            {
                              pdfIndex === 0 && jumblingConfig ? (
                                <span>
                                  Jumbling: {
                                    jumblingConfig.length > 0
                                      ? jumblingConfig.map((step, index) => (
                                          <span key={index}>
                                            ({step}){index < jumblingConfig.length - 1 ? ',' : ''}
                                          </span>
                                        ))
                                      : 'No steps available'
                                  }
                                </span>
                              ):(
                                <span className='text-center'></span>
                              )
                            }
                            </div>
                          </div>
                         </>
                      )} 
                      <iframe
                ref={(el) => (iframesRef.current[pdfIndex] = el)}
                key={`${pdfIndex}-${iframeKey}`}
                src={`${url}#page=${selectedPages[pdfIndex]}`}
                title={`PDF ${pdfIndex + 1}`}
                width="100%"
                height="260px"
                frameBorder="0"
                      />
                    </div>
                  </Col>
                ))}
            </Row>
          </div>
        )}
      </Row>
    </div>
  )
}

export default VerificationWindow