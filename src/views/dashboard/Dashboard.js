// Dashboard.js
import React from 'react';
import PropTypes from 'prop-types';
import { Card, Container } from 'react-bootstrap';
import { CCard, CCardBody, CCol, CCardHeader, CRow } from '@coreui/react';
import {
  CChartDoughnut,
} from '@coreui/react-chartjs';
import DashboardCard from './DashboardCard';
import DashboardCardData from './DashboardCardData';
import ActivityTable from './ActivityTable';

const Dashboard = () => {
  const { cardData, statusCount, loading } = DashboardCardData();

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Container fluid className='mt-0'>
        {/* cards */}
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

        {/* charts  */}
        <CRow>
          <CCol xs={8}>
            <CCard className="mb-4">
              <CCardHeader>My Activities</CCardHeader>
              <CCardBody>
                <ActivityTable />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol xs={4}>
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
        </CRow>

      </Container>
    </>
  );
};


DashboardCard.propTypes = {
  link: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  iconClass: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

export default Dashboard;
