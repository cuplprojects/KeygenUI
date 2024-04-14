import React from 'react';
import { Card, Container } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import DashboardCardData from './DashboardCardData'; // Import DashboardCardData component
import PropTypes from 'prop-types';
import { CCard, CCardBody, CCol, CCardHeader, CRow } from '@coreui/react'
import {
  CChartBar,
  CChartDoughnut,
  CChartLine,
  CChartPie,
  CChartPolarArea,
  CChartRadar,
} from '@coreui/react-chartjs'

const Dashboard = () => {
  const random = () => Math.round(Math.random() * 100)
  const { cardData } = DashboardCardData(); // Call DashboardCardData component to get the card data

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
              <CCardHeader>Doughnut Chart</CCardHeader>
              <CCardBody>
                <CChartDoughnut
                  data={{
                    labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
                    datasets: [
                      {
                        backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
                        data: [40, 20, 80, 10],
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
