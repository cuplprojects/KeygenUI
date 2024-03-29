import React from 'react';
import { Container } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import DashboardCardData from './DashboardCardData'; // Import DashboardCardData component
import PropTypes from 'prop-types';

const Dashboard = () => {
  const { cardData } = DashboardCardData(); // Call DashboardCardData component to get the card data

  return (
    <>
      <Container fluid>
        {/* cards */}
        <div className="container">
          <div className="row">
            {cardData.map((card, index) => (
              <DashboardCard key={index} {...card} />
            ))}
          </div>
        </div>
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
