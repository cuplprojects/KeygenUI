import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useUser } from "./../../context/UserContext";
import $ from 'jquery';
import { Card } from 'react-bootstrap';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import { CChartDoughnut } from '@coreui/react-chartjs';
import ActivityTable from './ActivityTable';

const baseUrl = process.env.REACT_APP_BASE_URL;
const statusUrl = `${baseUrl}/api/Papers/StatusCount`;

const Dashboard = () => {
  const { keygenUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [statusCount, setStatusCount] = useState({});
  const cardData = [
    {
      color: "",
      iconClass: "fa-user",
      link: "/users",
      title: "Registered user",
      getValue: () => statusCount.userCount
    },
    {
      color: "blue",
      iconClass: "fa-university",
      link: "/Groups",
      title: "Registered Groups",
      getValue: () => statusCount.groupCount
    },
    {
      color: "lightgreen",
      iconClass: "fa-file-circle-check",
      link: "/KeyGenerator",
      title: "Answer-Keys Generated",
      getValue: () => statusCount.keyGenerated
    },
    {
      color: "red",
      iconClass: "fa-note-sticky",
      link: "/Masters/papers",
      title: "All Papers",
      getValue: () => statusCount.allPapersCount
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(statusUrl, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        const statusCountData = await response.json();
        setStatusCount(statusCountData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const DashboardCard = ({ link, color, iconClass, title, getValue }) => {
    const counterRef = useRef(null);

    useEffect(() => {
      if (!loading) {
        $(counterRef.current)
          .find('.counter-icon i')
          .addClass(`fas ${iconClass}`);

        $(counterRef.current).prop('Counter', 0).animate(
          {
            Counter: getValue(),
          },
          {
            duration: 1000,
            easing: 'swing',
            step: function (now) {
              $(counterRef.current).find('.counter-value').text(Math.ceil(now));
            },
          }
        );

        $(counterRef.current).addClass(color);
      }
    }, [loading, getValue, iconClass, color]);

    return (
      <div className="col-md-4 col-lg-3 col-sm-6 mb-4">
        <Link to={link}>
          <div className="counter" ref={counterRef}>
            <div className="counter-icon">
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className={`fas ${iconClass}`}></i>}
            </div>
            <span className="counter-value">{!loading && getValue()}</span>
            <h3>{!loading && title}</h3>
          </div>
        </Link>
      </div>
    );
  };

  DashboardCard.propTypes = {
    link: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    iconClass: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    getValue: PropTypes.func.isRequired
  };

  return (
    <>
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Render cards */}
          <div className="container-fluid">
            <Card className='mb-3 mt-0'>
              <Card.Body>
                <div className="container">
                  <div className="row">
                    {cardData.map((card, index) => (
                      <DashboardCard key={index} {...card} />
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
            <CRow>
            <CCol xs={12} md={4}>
                <CCard className="mb-4">
                  <CCardHeader>Paper Status</CCardHeader>
                  <CCardBody>
                    {statusCount.keyGenerated === 0 && statusCount.masterUploaded === 0 && statusCount.pendingkeys === 0 ? (
                      <CChartDoughnut
                        data={{
                          labels: ['No Data'],
                          datasets: [
                            {
                              backgroundColor: ['#CCCCCC'],
                              data: [100],
                            },
                          ],
                        }}
                      />
                    ) : (
                      <CChartDoughnut
                        data={{
                          labels: ['Key Generated', 'Master Uploaded', 'Pending'],
                          datasets: [
                            {
                              backgroundColor: ['#FFC107', '#4CAF50', '#03A9F4'],
                              data: [
                                statusCount.keyGenerated,
                                statusCount.masterUploaded,
                                statusCount.pendingkeys,
                              ],
                            },
                          ],
                        }}
                      />
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol xs={12} md={8}>
                <CCard className="mb-4">
                  <CCardHeader>My Activities</CCardHeader>
                  <CCardBody>
                    <ActivityTable />
                  </CCardBody>
                </CCard>
              </CCol>

            </CRow>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
