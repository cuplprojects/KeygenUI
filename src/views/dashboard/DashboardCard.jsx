import React, { useEffect, useRef } from 'react';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const DashboardCard = ({ link, color, iconClass, value, title }) => {
    const counterRef = useRef(null);

    useEffect(() => {
        $(counterRef.current)
            .find('.counter-icon i')
            .addClass(`fas ${iconClass}`); // Change 'fa' to 'fas'

        $(counterRef.current).prop('Counter', 0).animate(
            {
                Counter: value,
            },
            {
                duration: 2000,
                easing: 'swing',
                step: function (now) {
                    $(counterRef.current).find('.counter-value').text(Math.ceil(now));
                },
            }
        );

        // Ensure the color is applied
        $(counterRef.current).addClass(color);
    }, [value, iconClass, color]);

    return (
        <div className="col-md-4 col-lg-3 col-sm-6 mb-4">
            <Link to={link}>
                <div className="counter" ref={counterRef}>
                    <div className="counter-icon">
                        <i></i>
                    </div>
                    <span className="counter-value">{value}</span>
                    <h3>{title}</h3>
                </div>
            </Link>
        </div>
    );
};

DashboardCard.propTypes = {
    link: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    iconClass: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired
};

export default DashboardCard;
