import React from 'react';
import { Container } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import DashboardCardData from './DashboardCardData'; // Import DashboardCardData component

const Dashboard = () => {
  const { cardData, loading } = DashboardCardData(); // Call DashboardCardData component to get the card data

  return (
    <>
      <Container fluid>
        {/* cards */}
        <div className="container">
          <div className="row">
            {!loading && cardData.map((card, index) => (
              <DashboardCard key={index} {...card} />
            ))}
          </div>
        </div>
      </Container>
    </>
  );
};

export default Dashboard;
