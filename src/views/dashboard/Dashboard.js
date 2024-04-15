// Dashboard.js
import React from 'react';
import PropTypes from 'prop-types';
import { Card, Container } from 'react-bootstrap';
import { CCard, CCardBody, CCol, CCardHeader, CRow } from '@coreui/react';
import {
  CChartBar,
  CChartDoughnut,
} from '@coreui/react-chartjs';
import DashboardCard from './DashboardCard';
import DashboardCardData from './DashboardCardData';

const Dashboard = () => {
  const { cardData, papersStatusCount } = DashboardCardData();

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
              <CCardHeader>Bar Chart</CCardHeader>
              <CCardBody>
                <CChartBar
                  data={{
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                    datasets: [
                      {
                        label: 'GitHub Commits',
                        backgroundColor: '#f87979',
                        data: [40, 20, 12, 39, 10, 40, 39, 80, 40],
                      },
                    ],
                  }}
                  labels="months"
                />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol xs={4}>
            <CCard className="mb-4">
              <CCardHeader>Paper Status</CCardHeader>
              <CCardBody>
                <CChartDoughnut
                  data={{
                    labels: ['Key Generated', 'Master Uploaded', 'Pending'],
                    datasets: [
                      {
                        backgroundColor: ['#FFC107', '#4CAF50', '#03A9F4'],
                        data: [
                          papersStatusCount.keyGenerated,
                          papersStatusCount.masterUploaded,
                          papersStatusCount.pending,
                        ],
                      },
                    ],
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Activity  */}
        <CRow>
          <CCol sm={6}>

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
