// this page will render pages which have not dashboard

import React from 'react';
import { Card, CardBody, CardGroup, Col, Container, Row } from 'react-bootstrap';
import loginicon from './../../../assets/images/loginicon.png'
// import logo from './../../../assets/images/logo.png'

import PropTypes from 'prop-types';

const PageLayout = ({ children }) => {
    return (
        <div>
            {/* Content specific to each page */}
            <main className='blur-5'>
                <div className="bg-body-tertiary min-vw-100 min-vh-100 d-flex align-items-center blur-5">
                    <Container fluid className='align-items-center loginbg ' >
                        <Row className='align-items-center justify-content-center'>
                            <Col md={8} lg={6} className='d-flex vh-100 d-none d-lg-block loginicon border-end border-4'>
                                {/* <img className='m-4' src={logo} alt="" width='60px' /> */}
                            </Col>
                            {/* right of login page  */}
                            <Col sm={8} md={7} lg={6} className='d-flex vh-100 align-items-center blur-5 shadow-left'>
                                <CardGroup className='container  p-md-5 flex-column'>
                                    <Card className='d-flex flex-row align-items-center justify-content-center gap-3 rounded mb-4 text-primary'>
                                        {/* <img src={logo} alt="" width='50px' /> */}
                                        <h1>CUPL KEY-GENERATOR</h1>
                                    </Card>
                                    <Card className="p-4 container rounded ">
                                        <CardBody className='m-6'>
                                            {/* cheldren cmponents */}
                                            {children}
                                        </CardBody>
                                    </Card>
                                </CardGroup>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </main>

            {/* Common Footer or any other elements */}
            {/* <footer> */}
            {/* Your footer content */}
            {/* </footer> */}
        </div>
    );
};
PageLayout.propTypes = {
    children: PropTypes.node.isRequired, // Children should be a node and is required
};

export default PageLayout;
