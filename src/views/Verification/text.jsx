import React, { useState, useEffect } from 'react';
import { Button, Select, notification, Checkbox, Form, Input } from 'antd';
import { Card, Table } from 'react-bootstrap';
import axios from 'axios';
import ZoomedImage from './ZoomedImage';
import FullImageView from './FullImageView';
import { useProjectActions, useProjectId } from '@/store/ProjectState';
import { CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { handleDecrypt, handleEncrypt } from '@/Security/Security';
import { convertLegacyProps } from 'antd/es/button';
import { useDatabase } from '@/store/DatabaseStore';
import useFlags from '@/CustomHooks/useFlag';
import AllotFlag from './AllotFlags';
import { useFlagActions, useFlagData } from '@/store/useFlagStore';
import useProject from '@/CustomHooks/useProject';
import { useUserToken } from '@/store/UserDataStore';
import noomrimg from '@/assets/images/NoOMRImage.png';

const apiurl = import.meta.env.VITE_API_URL;
const { Option } = Select;

const CorrectionPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allDataCorrected, setAllDataCorrected] = useState(false);
  const [expandMode, setExpandMode] = useState(false);
  const projectId = useProjectId();
  const { setProjectId } = useProjectActions();
  const { flags, corrected, remaining, getFlags } = useFlags(projectId);
  const [selectedField, setSelectedField] = useState('all');
  const [unchangedata, setUnchangeData] = useState('');
  const [noChangeRequired, setNoChangeRequired] = useState(false);
  const [isViewRegData, setIsViewRegData] = useState(false);
  const [filters, setFilters] = useState([{ fieldName: '', fieldValue: '' }]);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [regData, setRegData] = useState([]);
  const [currentRegIndex, setCurrentRegIndex] = useState(0);
  const [parsedData, setParsedData] = useState([]);
  const database = useDatabase();
  // const [flagData, setFlagData] = useState([]);
  const flagData = useFlagData();
  const { clearFlags } = useFlagActions();
  const { projectName, fetchProjectName } = useProject(projectId);
  const token = useUserToken();

  // expand mode from Localstororage if refress the page
  useEffect(() => {
    // Check if 'expandMode' is stored in localStorage
    const isExpandMode = localStorage.getItem('expandMode');
    // If 'expandMode' is found in localStorage and it's true, set expandMode to true
    if (isExpandMode === 'true') {
      setExpandMode(true);
    }
    // No dependencies needed here, as we only want to read from localStorage once on component mount
  }, []);

  useEffect(() => {
    if (data[currentIndex]) {
      setUnchangeData(data[currentIndex].fieldNameValue);
    }
  }, [currentIndex, data]);

  useEffect(() => {
    getFlags();
    fetchFlagData();
  }, [projectId, selectedField, flagData]);

  // useEffect(() => {
  //  if (flagData[currentIndex].isCorrected) {
  //   console.log(flagData[currentIndex])
  //   setCurrentIndex(currentIndex+1)
  //  }
  // }, [currentIndex]);

  useEffect(() => {
    const selectedfield = localStorage.getItem('selectedField');
    if (selectedfield) {
      setSelectedField(selectedfield);
    }
  }, []);

  const handleFieldChange = (value) => {
    setSelectedField(value);
    localStorage.setItem('selectedField', value); // Save selected field to localStorage
  };

  // Get Reg Filte Keys
  const GetRegFilterKeys = async () => {
    try {
      const response = await axios.get(
        `${apiurl}/Registration/GetKeys?whichDatabase=${database}&ProjectId=${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAvailableOptions(response.data.keys);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchFlagData = async () => {
    setCurrentIndex(0);
    setLoading(true);
    try {
      if (flagData) {
        const fieldConfigResponse = await axios.get(
          `${apiurl}/FieldConfigurations/GetByProjectId/${projectId}?WhichDatabase=${database}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const decryptedfieldConfigResponse = JSON.parse(handleDecrypt(fieldConfigResponse.data));
        const fieldConfigurations = decryptedfieldConfigResponse;
        // Create a map for quick lookup of field configurations by field name
        const fieldConfigMap = fieldConfigurations.reduce((map, config) => {
          map[config.FieldName] = config;
          return map;
        }, {});

        const flagsResult = flagData;

        const mergedData = await Promise.all(
          flagsResult?.map(async (flag) => {
            const imageConfigResponse = await axios.get(
              `${apiurl}/ImageConfigs/ByProjectId/${projectId}?WhichDatabase=${database}`,
              {
                headers: { accept: 'text/plain', Authorization: `Bearer ${token}` },
              },
            );
            const imageresponse = JSON.parse(handleDecrypt(imageConfigResponse.data));
            const imageConfigResult = imageresponse[0];
            const parsedAnnotations = JSON.parse(imageConfigResult.AnnotationsJson).map(
              (annotation) => ({
                FieldName: annotation.FieldName,
                coordinates: JSON.parse(annotation.Coordinates.replace(/'/g, '"')),
                fieldNameValue: '',
                imageUrl: '',
              }),
            );

            let imageUrl = '';
            try {
              const omrImageResponse = await axios.get(
                `${apiurl}/OMRData/OMRImagebyName?WhichDatabase=${database}&ProjectId=${projectId}&Name=${flag.barCode}`,
                {
                  params: { WhichDatabase: database },
                  headers: { accept: 'text/plain', Authorization: `Bearer ${token}` },
                },
              );
              imageUrl = 'data:image/png;base64,' + omrImageResponse.data.filePath;
            } catch (error) {
              if (error.response && error.response.status === 404) {
                // If the image is not found (404), set the placeholder image URL

                imageUrl = noomrimg;
              } else {
                console.error('Error fetching OMR image:', error);
                // For other errors, you can also set a placeholder image or handle it differently
                imageUrl = noomrimg;

              }
            }

            // Find the annotation for the current flag's field name
            const annotation = parsedAnnotations.find(
              (annotation) => annotation.FieldName === flag.field,
            );

            // Get the field configuration for the current flag's field name
            const fieldConfig = fieldConfigMap[flag.field] || {};

            return {
              ...annotation,
              flagId: flag.flagId,
              remarks: flag.remarks,
              fieldNameValue: flag.fieldNameValue || '',
              FieldName: flag.field,
              barCode: flag.barCode,
              projectId: projectId,
              isCorrected: true,
              imageUrl,
              noChangeRequired: false,
              fieldConfig, // Adding the field configuration to the flag data
            };
          }),
        );

        setData(mergedData);
      }
      // Fetch field configurations
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (index, newValue) => {
    const updatedData = [...data];
    updatedData[index].fieldNameValue = newValue;
    setData(updatedData);
  };

  const sendPostRequest = async (currentData) => {
    try {
      if (!currentData) {
        console.error('Current data is undefined or null');
        return;
      }

      const payload = {
        barCode: currentData.barCode,
        fieldName: currentData.FieldName,
        value: currentData.fieldNameValue,
      };

      const payloadtobesend = {
        cyphertextt: handleEncrypt(JSON.stringify(payload)),
      };
      const response = await axios.post(
        `${apiurl}/Correction/SubmitCorrection?WhichDatabase=${database}&status=${
          noChangeRequired ? 2 : 3
        }&ProjectId=${projectId}`,
        payloadtobesend,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
      );
      setNoChangeRequired(false);
      console.log('Data posted successfully:', response.data);
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  const handleNext = async () => {
    let fieldData = data;
    const currentData = fieldData[currentIndex];
    if (!currentData) {
      console.error('Current data is undefined or null');
      return;
    }
    if (unchangedata === currentData.fieldNameValue && !noChangeRequired) {
      console.log('Data has not changed:', unchangedata);
      notification.error({
        message: 'Alert',
        description: 'Please correct the data before submit',
        duration: 3,
      });
      return;
    } else {
      await sendPostRequest(currentData);

      if (currentIndex < fieldData.length - 1) {
        setCurrentIndex(currentIndex + 1);
        getFlags();
        setUnchangeData(data[currentIndex + 1]?.fieldNameValue);
      } else {
        // fetchFlagData();
        clearFlags();
      }
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUnchangeData(data[currentIndex - 1]?.fieldNameValue);
    }
  };

  const toggleExpandMode = () => {
    setExpandMode(!expandMode);
    localStorage.setItem('expandMode', !expandMode);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.ctrlKey && event.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, data, allDataCorrected]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleFilterChange = (index, field, value) => {
    const updatedFilters = [...filters];
    updatedFilters[index][field] = value;
    setFilters(updatedFilters);

    // Remove selected fieldName from availableOptions
  };

  // removing filter items
  const handleRemoveFilter = (index) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);
  };

  // get student filterd data
  const handleSubmitFilter = async (e) => {
    try {
      const transformedFilters = filters.reduce((obj, item) => {
        obj[item.fieldName] = item.fieldValue;
        return obj;
      }, {});

      const dataToSend = { filters: transformedFilters };

      console.log('Data to send:', dataToSend);
      const response = await axios.post(
        `${apiurl}/Registration/ByFilters?WhichDatabase=${database}&ProjectId=${projectId}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setRegData(response.data);
      console.log('Filtered data:', response.data);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  const addFilter = () => {
    setFilters([...filters, { fieldName: '', fieldValue: '' }]);
  };

  // Handle bYpass
  const handleByPass = async (data) => {
    if (!data || !data.flagId) {
      notification.error({
        message: 'Error',
        description: 'Invalid data',
        duration: 2,
      });
      return;
    }

    const url = `${apiurl}/Flags/${data.flagId}?WhichDatabase=${database}`;
    const requestData = {
      field: data.FieldName,
      fieldNameValue: data.fieldNameValue,
      flagId: data.flagId,
      remarks: data.remarks,
      projectId: data.projectId,
      isCorrected: true,
    };

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        notification.success({
          message: 'Flag bypassed successfully',
          duretion: 2,
        });
        setCurrentIndex(currentIndex + 1);
        getFlags();
      } else {
        const errorData = await response.json();
        notification.error({
          message: errorData.message,
          duretion: 2,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error bypassing flag',
      });
    }
  };

  // handle click show reg data btn
  const handleShowRegDataTableClick = () => {
    setIsViewRegData(true); // Set isViewRegData to true
    GetRegFilterKeys(); // Call GetRegFilterKeys function
  };

  const parseRegData = (data) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  };

  const showNextReg = () => {
    setCurrentRegIndex((prevIndex) => prevIndex + 1);
  };

  const showPreviousReg = () => {
    setCurrentRegIndex((prevIndex) => prevIndex - 1);
  };

  
    useEffect(()=>{
        const currentReg = regData[currentRegIndex];
  const parsedRegData = currentReg
    ? { 'Roll Number': currentReg.rollNumber, ...parseRegData(currentReg.registrationsData) }
    : null;
    setParsedData(parsedRegData)

    },[regData])

  return (
    <>
      <div className="d-flex align-items-center justify-content-between">
        {/* <Select
          placeholder="All Fields"
          style={{ width: 200 }}
          value={selectedField}
          onChange={handleFieldChange} // Corrected onChange handler
        >
          <Option value="all">All</Option>
          {flags.map((field, index) => (
            <Option key={index} value={field.fieldName}>
              {field.fieldName}
            </Option>
          ))}
        </Select> */}
        <AllotFlag fieldNames={flags} />
        <Button type="primary" onClick={toggleExpandMode}>
          {expandMode ? 'Zoomed View' : 'Expand OMR'}
        </Button>
      </div>
      <p className="text-danger fs-5 m-1 text-center">Remaining Flags: {remaining}</p>

      <div className="table-responsive">
        <Table className="table-bordered table-striped text-center">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>OMR Barcode Number</th>
              <th>Remark</th>
              <th>Flag Number</th>
              <th>No Change Required</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{projectName}</td>
              <td>{data[currentIndex]?.barCode}</td>
              <td>{data[currentIndex]?.remarks}</td>
              <td>{data[currentIndex]?.flagId}</td>
              <td>
                <Checkbox
                  checked={noChangeRequired}
                  onChange={() => setNoChangeRequired(!noChangeRequired)}
                />
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
      <div className="h-75 d-flex">
        {isViewRegData ? (
          <div className="w-50 me-2 border p-2">
            <div className="c-pointer text-end">
              <span onClick={() => setIsViewRegData(false)}>
                <CloseCircleOutlined style={{ fontSize: '24px', color: 'red' }} />
              </span>
            </div>
            <h5 className="mb-2 text-center">Registration Data</h5>
            <Card>
              <Card.Body>
                <div className="filters-section">
                  {filters.map((filter, index) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex">
                        <Select
                          value={filter.fieldName}
                          placeholder="Select field"
                          onChange={(value) => handleFilterChange(index, 'fieldName', value)}
                          style={{ width: 120, marginRight: 8 }}
                        >
                          {availableOptions
                            .filter(
                              (option) => !filters.some((filter) => filter.fieldName === option),
                            ) // Filter out selected fieldNames
                            .map((option) => (
                              <Option key={option} value={option}>
                                {option}
                              </Option>
                            ))}
                        </Select>
                        <Input
                          value={filter.fieldValue}
                          onChange={(e) => handleFilterChange(index, 'fieldValue', e.target.value)}
                          style={{ width: 200, marginRight: 8 }}
                          placeholder="Enter value"
                        />
                        <div className="text-end">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveFilter(index)}
                          >
                            X
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="c-pointer text-primary" onClick={addFilter}>
                      Add Filter
                    </span>
                    <button className="btn btn-sm btn-primary" onClick={handleSubmitFilter}>
                      Search
                    </button>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <div>
              <div>
                {parsedData ? (
                  <>
                    <p className="text-danger m-2 text-center">{regData.length} Resultes Found</p>
                    <table className="table-bordered table-striped mr-0 table">
                      <thead>
                        <tr>
                          <th scope="col">Field Name</th>
                          <th scope="col">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(parsedData).map(([fieldName, fieldValue], index) => (
                          <tr key={index}>
                            <td className="text-capitalize">{fieldName}</td>
                            <td className="text-capitalize">{fieldValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="fs-6 m-3 text-center">
                      Showing {currentRegIndex + 1} of {regData.length}
                    </p>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={currentRegIndex === 0}
                        onClick={showPreviousReg}
                      >
                        Previous
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={currentRegIndex === regData.length - 1}
                        onClick={showNextReg}
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Button type="primary" onClick={() => handleShowRegDataTableClick()}>
            Get Registration data
          </Button>
        )}
        <div className="w-75 position-relative m-auto border p-4" style={{ minHeight: '100%' }}>
          {!allDataCorrected && data[currentIndex] ? (
            expandMode ? (
              <FullImageView
                data={data[currentIndex]}
                onUpdate={(newValue) =>
                  handleUpdate(
                    data.findIndex((item) => item === data[currentIndex]),
                    newValue,
                  )
                }
                onNext={handleNext}
              />
            ) : (
              <ZoomedImage
                data={data[currentIndex]}
                onUpdate={(newValue) =>
                  handleUpdate(
                    data.findIndex((item) => item === data[currentIndex]),
                    newValue,
                  )
                }
                onNext={handleNext}
              />
            )
          ) : (
            <div className="text-center">
              <p className="fs-3">All assigned Flags corrected</p>
              {/* {remaining ? (
                <>
                  <p className="fs-3">Total Remaining: {remaining}</p>
                </>
              ) : (
                <></>
              )} */}
            </div>
          )}
        </div>{' '}
        <div className="d-flex flex-column">
          <div className="d-flex justify-content-evenly m-1 gap-2">
            <Button type="primary" onClick={handlePrevious} disabled={currentIndex === 0}>
              Previous
            </Button>
            <Button type="primary" onClick={handleNext} disabled={allDataCorrected}>
              Next
            </Button>
          </div>
          {console.log(data[currentIndex])}
          {!data[currentIndex]?.barCode ? (
            <div className="text-center">
              <Button type="primary" onClick={() => handleByPass(data[currentIndex])}>
                ByPass
              </Button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default CorrectionPage;

// import React, { useState, useEffect } from 'react';
// import { Button, Select, notification, Checkbox, Form, Input } from 'antd';
// import { Card, Table } from 'react-bootstrap';
// import axios from 'axios';
// import ZoomedImage from './ZoomedImage';
// import FullImageView from './FullImageView';
// import { useProjectActions, useProjectId } from '@/store/ProjectState';
// import { CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
// import { handleDecrypt, handleEncrypt } from '@/Security/Security';
// import { convertLegacyProps } from 'antd/es/button';
// import { useDatabase } from '@/store/DatabaseStore';
// import useFlags from '@/CustomHooks/useFlag';
// import { useUserToken } from '@/store/UserDataStore';

// const apiurl = import.meta.env.VITE_API_URL;
// const { Option } = Select;

// const CorrectionPage = () => {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [allDataCorrected, setAllDataCorrected] = useState(false);
//   const [expandMode, setExpandMode] = useState(false);
//   const projectId = useProjectId();
//   const { setProjectId } = useProjectActions();
//   const { flags, corrected, remaining, getFlags } = useFlags(projectId);
//   const [selectedField, setSelectedField] = useState('all');
//   const [unchangedata, setUnchangeData] = useState('');
//   const [noChangeRequired, setNoChangeRequired] = useState(false);
//   const [isViewRegData, setIsViewRegData] = useState(false);
//   const [filters, setFilters] = useState([{ fieldName: '', fieldValue: '' }]);
//   const [availableOptions, setAvailableOptions] = useState([]);
//   const [regData, setRegData] = useState([]);
//   const [currentRegIndex, setCurrentRegIndex] = useState(0);
//   const database = useDatabase();
//   const token = useUserToken();

//   // expand mode from Localstororage if refress the page
//   useEffect(() => {
//     // Check if 'expandMode' is stored in localStorage
//     const isExpandMode = localStorage.getItem('expandMode');
//     // If 'expandMode' is found in localStorage and it's true, set expandMode to true
//     if (isExpandMode === 'true') {
//       setExpandMode(true);
//     }
//     // No dependencies needed here, as we only want to read from localStorage once on component mount
//   }, []);

//   useEffect(() => {
//     if (data[currentIndex]) {
//       setUnchangeData(data[currentIndex].fieldNameValue);
//     }
//   }, [currentIndex, data]);

//   useEffect(() => {
//     getFlags();
//     fetchFlagData();
//   }, [projectId, selectedField]);
//   console.log(currentIndex);
//   useEffect(() => {
//     const selectedfield = localStorage.getItem('selectedField');
//     if (selectedfield) {
//       setSelectedField(selectedfield);
//     }
//   }, []);

//   const handleFieldChange = (value) => {
//     setSelectedField(value);
//     localStorage.setItem('selectedField', value); // Save selected field to localStorage
//   };

//   // Get Reg Filte Keys
//   const GetRegFilterKeys = async () => {
//     try {
//       const response = await axios.get(
//         `${apiurl}/Registration/GetKeys?whichDatabase=${database}&ProjectId=${projectId}`,{
//           headers:{
//           Authorization : `Bearer ${token}`
//         }}
//       );
//       setAvailableOptions(response.data.keys);
//       console.log(response.data.keys);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   const fetchFlagData = async () => {
//     setCurrentIndex(0);
//     setLoading(true);

//     try {
//       // Fetch field configurations
//       const fieldConfigResponse = await axios.get(
//         `${apiurl}/FieldConfigurations/GetByProjectId/${projectId}?WhichDatabase=${database}`,{
//           headers:{
//           Authorization : `Bearer ${token}`
//         }}
//       );
//       const decryptedfieldConfigResponse = JSON.parse(handleDecrypt(fieldConfigResponse.data));
//       const fieldConfigurations = decryptedfieldConfigResponse;
//       // Create a map for quick lookup of field configurations by field name
//       const fieldConfigMap = fieldConfigurations.reduce((map, config) => {
//         map[config.FieldName] = config;
//         return map;
//       }, {});

//       // Fetch flags by category
//       const flagsResponse = await axios.get(
//         `${apiurl}/Correction/GetFlagsByCategory?WhichDatabase=${database}&ProjectID=${projectId}&FieldName=${selectedField}`,{
//           headers:{
//           Authorization : `Bearer ${token}`
//         }}
//       );
//       console.log(flagsResponse.data)
//       // const decryptedFlagsResponse = JSON.parse(handleDecrypt(flagsResponse.data));
//       const flagsResult = flagsResponse.data;

//       const mergedData = await Promise.all(
//         flagsResult.map(async (flag) => {
//           const imageConfigResponse = await axios.get(
//             `${apiurl}/ImageConfigs/ByProjectId/${projectId}?WhichDatabase=${database}`,
//             {
//               headers: { accept: 'text/plain' },
//               Authorization : `Bearer ${token}`,
//             },
//           );
//           const imageresponse = JSON.parse(handleDecrypt(imageConfigResponse.data));
//           const imageConfigResult = imageresponse[0];
//           const parsedAnnotations = JSON.parse(imageConfigResult.AnnotationsJson).map(
//             (annotation) => ({
//               FieldName: annotation.FieldName,
//               coordinates: JSON.parse(annotation.Coordinates.replace(/'/g, '"')),
//               fieldNameValue: '',
//               imageUrl: '',
//             }),
//           );

//           let imageUrl = '';
//           try {
//             const omrImageResponse = await axios.get(
//               `${apiurl}/OMRData/OMRImagebyName?WhichDatabase=${database}&ProjectId=${projectId}&Name=${flag.barCode}`,
//               {
//                 params: { WhichDatabase: database },
//                 headers: {
//                   accept: 'text/plain',
//                   Authorization: `Bearer ${token}`,
//                 },
//               },
//             );
//             imageUrl = 'data:image/png;base64,' + omrImageResponse.data.filePath;
//           } catch (error) {
//             if (error.response && error.response.status === 404) {
//               // If the image is not found (404), set the placeholder image URL
//               imageUrl = 'https://placehold.co/600x400?text=No+OMR+Image+Found';
//             } else {
//               console.error('Error fetching OMR image:', error);
//               // For other errors, you can also set a placeholder image or handle it differently
//               imageUrl = 'https://placehold.co/600x400?text=No+OMR+Found';
//             }
//           }

//           // Find the annotation for the current flag's field name
//           const annotation = parsedAnnotations.find(
//             (annotation) => annotation.FieldName === flag.field,
//           );

//           // Get the field configuration for the current flag's field name
//           const fieldConfig = fieldConfigMap[flag.field] || {};

//           return {
//             ...annotation,
//             flagId: flag.flagId,
//             remarks: flag.remarks,
//             fieldNameValue: flag.fieldNameValue || '',
//             FieldName: flag.field,
//             barCode: flag.barCode,
//             projectId: projectId,
//             isCorrected: true,
//             imageUrl,
//             noChangeRequired: false,
//             fieldConfig, // Adding the field configuration to the flag data
//           };
//         }),
//       );

//       setData(mergedData);
//       console.log(mergedData);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdate = (index, newValue) => {
//     const updatedData = [...data];
//     updatedData[index].fieldNameValue = newValue;
//     setData(updatedData);
//   };

//   const sendPostRequest = async (currentData) => {
//     try {
//       if (!currentData) {
//         console.error('Current data is undefined or null');
//         return;
//       }

//       const payload = {
//         barCode: currentData.barCode,
//         fieldName: currentData.FieldName,
//         value: currentData.fieldNameValue,
//       };

//       const payloadtobesend = {
//         cyphertextt: handleEncrypt(JSON.stringify(payload))
//       };
//       console.log(payloadtobesend)
//       const response = await axios.post(
//         `${apiurl}/Correction/SubmitCorrection?WhichDatabase=${database}&status=${
//           noChangeRequired ? 2 : 3
//         }&ProjectId=${projectId}`,
//         payloadtobesend,
//         { headers: { 'Content-Type': 'application/json' , Authorization: `Bearer ${token}`,} },
//       );
//       setNoChangeRequired(false);
//       console.log('Data posted successfully:', response.data);
//     } catch (error) {
//       console.error('Error posting data:', error);
//     }
//   };

//   const handleNext = async () => {
//     let fieldData = data;
//     const currentData = fieldData[currentIndex];
//     if (!currentData) {
//       console.error('Current data is undefined or null');
//       return;
//     }
//     if (unchangedata === currentData.fieldNameValue && !noChangeRequired) {
//       console.log('Data has not changed:', unchangedata);
//       notification.error({
//         message: 'Alert',
//         description: 'Please correct the data before submit',
//         duration: 3,
//       });
//       return;
//     } else {
//       await sendPostRequest(currentData);

//       if (currentIndex < fieldData.length - 1) {
//         setCurrentIndex(currentIndex + 1);
//         getFlags();
//         setUnchangeData(data[currentIndex + 1]?.fieldNameValue);
//       } else {
//         fetchFlagData();
//       }
//     }
//   };

//   const handlePrevious = async () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//       setUnchangeData(data[currentIndex - 1]?.fieldNameValue);
//     }
//   };

//   const toggleExpandMode = () => {
//     setExpandMode(!expandMode);
//     localStorage.setItem('expandMode', !expandMode);
//   };

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.ctrlKey && event.key === 'ArrowLeft') {
//         handlePrevious();
//       } else if (event.ctrlKey && event.key === 'ArrowRight') {
//         handleNext();
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [currentIndex, data, allDataCorrected]);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   const handleFilterChange = (index, field, value) => {
//     const updatedFilters = [...filters];
//     updatedFilters[index][field] = value;
//     setFilters(updatedFilters);

//     // Remove selected fieldName from availableOptions
//   };

//   // removing filter items
//   const handleRemoveFilter = (index) => {
//     const updatedFilters = filters.filter((_, i) => i !== index);
//     setFilters(updatedFilters);

//     // Add back removed fieldName to availableOptions if it exists in the removed filter
//     // if (filters[index]?.fieldName) {
//     //   setAvailableOptions([...availableOptions, filters[index].fieldName]);
//     // }
//   };

//   // get student filterd data
//   const handleSubmitFilter = async (e) => {
//     try {
//       const transformedFilters = filters.reduce((obj, item) => {
//         obj[item.fieldName] = item.fieldValue;
//         return obj;
//       }, {});

//       const dataToSend = { filters: transformedFilters };

//       console.log('Data to send:', dataToSend);
//       const response = await axios.post(
//         `${apiurl}/Registration/ByFilters?WhichDatabase=${database}&ProjectId=${projectId}`,
//         dataToSend,{
//           headers:{
//           Authorization : `Bearer ${token}`
//         }}
//       );
//       setRegData(response.data);
//       console.log('Filtered data:', response.data);
//     } catch (error) {
//       console.error('Error fetching filtered data:', error);
//     }
//   };

//   const addFilter = () => {
//     setFilters([...filters, { fieldName: '', fieldValue: '' }]);
//   };

//   // const handleSubmitfilter = async () => {
//   //   // Transform filters array into an object
//   //   const transformedFilters = filters.reduce((obj, item) => {
//   //     obj[item.fieldName] = item.fieldValue;
//   //     return obj;
//   //   }, {});

//   //   // Example: Fetch filtered data based on transformedFilters
//   //   try {
//   //     console.log(transformedFilters);
//   //     const response = await axios.post(`${apiurl}/FilterEndpoint`, transformedFilters,{
//   //         headers:{
//   //            Authorization : `Bearer ${token}`
//   //          }
//   //        });
//   //     // Handle response data as needed
//   //     console.log('Filtered data:', response.data);
//   //   } catch (error) {
//   //     console.error('Error fetching filtered data:', error);
//   //   }
//   // };

//   // Handle bYpass
//   const handleByPass = async (data) => {
//     console.log(data);
//     if (!data || !data.flagId) {
//       notification.error({
//         message: 'Error',
//         description: 'Invalid data',
//         duration: 2,
//       });
//       return;
//     }

//     const url = `${apiurl}/Flags/${data.flagId}`;
//     const requestData = {
//       field: data.FieldName,
//       fieldNameValue: data.fieldNameValue,
//       flagId: data.flagId,
//       remarks: data.remarks,
//       projectId: data.projectId,
//       isCorrected: true,
//     };

//     try {
//       const response = await fetch(url, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(requestData),
//       });

//       if (response.ok) {
//         notification.success({
//           message: 'Flag bypassed successfully',
//           duretion: 2,
//         });
//         setCurrentIndex(currentIndex + 1);
//         getFlags();
//       } else {
//         const errorData = await response.json();
//         notification.error({
//           message: errorData.message,
//           duretion: 2,
//         });
//       }
//     } catch (error) {
//       notification.error({
//         message: 'Error bypassing flag',
//       });
//     }
//   };

//   // handle click show reg data btn
//   const handleShowRegDataTableClick = () => {
//     setIsViewRegData(true); // Set isViewRegData to true
//     GetRegFilterKeys(); // Call GetRegFilterKeys function
//   };

//   const parseRegData = (data) => {
//     try {
//       return JSON.parse(data);
//     } catch (error) {
//       console.error('Error parsing JSON:', error);
//       return null;
//     }
//   };

//   const showNextReg = () => {
//     setCurrentRegIndex((prevIndex) => prevIndex + 1);
//   };

//   const showPreviousReg = () => {
//     setCurrentRegIndex((prevIndex) => prevIndex - 1);
//   };

//   const currentReg = regData[currentRegIndex];
//   const parsedData = currentReg
//     ? { 'Roll Number': currentReg.rollNumber, ...parseRegData(currentReg.registrationsData) }
//     : null;

//   return (
//     <>
//       <div className="d-flex align-items-center justify-content-between">
//         <Select
//           placeholder="All Fields"
//           style={{ width: 200 }}
//           value={selectedField}
//           onChange={handleFieldChange} // Corrected onChange handler
//         >
//           <Option value="all">All</Option>
//           {flags.map((field, index) => (
//             <Option key={index} value={field.fieldName}>
//               {field.fieldName}
//             </Option>
//           ))}
//         </Select>
//         <Button type="primary" onClick={toggleExpandMode}>
//           {expandMode ? 'Zoomed View' : 'Expand OMR'}
//         </Button>
//       </div>
//       <p className="text-danger fs-5 m-1 text-center">Remaining Flags: {remaining}</p>

//       <div className="table-responsive">
//         <Table className="table-bordered table-striped text-center">
//           <thead>
//             <tr>
//               <th>Project Name</th>
//               <th>OMR Barcode Number</th>
//               <th>Remark</th>
//               <th>Flag Number</th>
//               <th>No Change Required</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>Project {projectId}</td>
//               <td>{data[currentIndex]?.barCode}</td>
//               <td>{data[currentIndex]?.remarks}</td>
//               <td>{data[currentIndex]?.flagId}</td>
//               <td>
//                 <Checkbox
//                   checked={noChangeRequired}
//                   onChange={() => setNoChangeRequired(!noChangeRequired)}
//                 />
//               </td>
//             </tr>
//           </tbody>
//         </Table>
//       </div>
//       <div className="h-75 d-flex">
//         {isViewRegData ? (
//           <div className="w-50 me-2 border p-2">
//             <div className="c-pointer text-end">
//               <span onClick={() => setIsViewRegData(false)}>
//                 <CloseCircleOutlined style={{ fontSize: '24px', color: 'red' }} />
//               </span>
//             </div>
//             <h5 className="mb-2 text-center">Registration Data</h5>
//             <Card>
//               <Card.Body>
//                 <div className="filters-section">
//                   {filters.map((filter, index) => (
//                     <div key={index} className="mb-3">
//                       <div className="d-flex">
//                         <Select
//                           value={filter.fieldName}
//                           placeholder="Select field"
//                           onChange={(value) => handleFilterChange(index, 'fieldName', value)}
//                           style={{ width: 120, marginRight: 8 }}
//                         >
//                           {availableOptions
//                             .filter(
//                               (option) => !filters.some((filter) => filter.fieldName === option),
//                             ) // Filter out selected fieldNames
//                             .map((option) => (
//                               <Option key={option} value={option}>
//                                 {option}
//                               </Option>
//                             ))}
//                         </Select>
//                         <Input
//                           value={filter.fieldValue}
//                           onChange={(e) => handleFilterChange(index, 'fieldValue', e.target.value)}
//                           style={{ width: 200, marginRight: 8 }}
//                           placeholder="Enter value"
//                         />
//                         <div className="text-end">
//                           <button
//                             className="btn btn-danger btn-sm"
//                             onClick={() => handleRemoveFilter(index)}
//                           >
//                             X
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   <div className="d-flex align-items-center justify-content-between mb-3">
//                     <span className="c-pointer text-primary" onClick={addFilter}>
//                       Add Filter
//                     </span>
//                     <button className="btn btn-sm btn-primary" onClick={handleSubmitFilter}>
//                       Search
//                     </button>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>

//             <div>
//               <div>
//                 {parsedData ? (
//                   <>
//                     <p className="text-danger m-2 text-center">{regData.length} Resultes Found</p>
//                     <table className="table-bordered table-striped mr-0 table">
//                       <thead>
//                         <tr>
//                           <th scope="col">Field Name</th>
//                           <th scope="col">Value</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {Object.entries(parsedData).map(([fieldName, fieldValue], index) => (
//                           <tr key={index}>
//                             <td className="text-capitalize">{fieldName}</td>
//                             <td className="text-capitalize">{fieldValue}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                     <p className="fs-6 m-3 text-center">
//                       Showing {currentRegIndex + 1} of {regData.length}
//                     </p>
//                     <div className="d-flex align-items-center justify-content-between mb-3">
//                       <button
//                         className="btn btn-primary btn-sm"
//                         disabled={currentRegIndex === 0}
//                         onClick={showPreviousReg}
//                       >
//                         Previous
//                       </button>
//                       <button
//                         className="btn btn-primary btn-sm"
//                         disabled={currentRegIndex === regData.length - 1}
//                         onClick={showNextReg}
//                       >
//                         Next
//                       </button>
//                     </div>
//                   </>
//                 ) : (
//                   <p>No data available</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <Button type="primary" onClick={() => handleShowRegDataTableClick()}>
//             Get Registration data
//           </Button>
//         )}
//         <div className="w-75 position-relative m-auto border p-4" style={{ minHeight: '100%' }}>
//           {!allDataCorrected && data[currentIndex] ? (
//             expandMode ? (
//               <FullImageView
//                 data={data[currentIndex]}
//                 onUpdate={(newValue) =>
//                   handleUpdate(
//                     data.findIndex((item) => item === data[currentIndex]),
//                     newValue,
//                   )
//                 }
//                 onNext={handleNext}
//               />
//             ) : (
//               <ZoomedImage
//                 data={data[currentIndex]}
//                 onUpdate={(newValue) =>
//                   handleUpdate(
//                     data.findIndex((item) => item === data[currentIndex]),
//                     newValue,
//                   )
//                 }
//                 onNext={handleNext}
//               />
//             )
//           ) : (
//             <div className="text-center">
//               <p className="fs-3">All data corrected</p>
//             </div>
//           )}
//         </div>{' '}
//         <div className="d-flex flex-column">
//           <div className="d-flex justify-content-evenly m-1 gap-2">
//             <Button type="primary" onClick={handlePrevious} disabled={currentIndex === 0}>
//               Previous
//             </Button>
//             <Button type="primary" onClick={handleNext} disabled={allDataCorrected}>
//               Next
//             </Button>
//           </div>
//           {!data[currentIndex]?.barCode ? (
//             <div className="text-center">
//               <Button type="primary" onClick={() => handleByPass(data[currentIndex])}>
//                 ByPass
//               </Button>
//             </div>
//           ) : (
//             <></>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default CorrectionPage;
