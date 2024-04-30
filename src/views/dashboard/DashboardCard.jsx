// import React from 'react'
// import { Link } from 'react-router-dom';

// const DashboardCard = ({ link, color, iconClass, title, getValue }) => {
//   const counterRef = useRef(null);

//   useEffect(() => {
//     if (!loading) {
//       $(counterRef.current)
//         .find('.counter-icon i')
//         .addClass(`fas ${iconClass}`);

//       $(counterRef.current).prop('Counter', 0).animate(
//         {
//           Counter: getValue(),
//         },
//         {
//           duration: 2000,
//           easing: 'swing',
//           step: function (now) {
//             $(counterRef.current).find('.counter-value').text(Math.ceil(now));
//           },
//         }
//       );

//       $(counterRef.current).addClass(color);
//     }
//   }, [loading, getValue, iconClass, color]);

//   return (
//     <div className="col-md-4 col-lg-3 col-sm-6 mb-4">
//       <Link to={link}>
//         <div className="counter" ref={counterRef}>
//           <div className="counter-icon">
//             {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className={`fas ${iconClass}`}></i>}
//           </div>
//           <span className="counter-value">{!loading && getValue()}</span>
//           <h3>{!loading && title}</h3>
//         </div>
//       </Link>
//     </div>
//   );
// };

// DashboardCard.propTypes = {
//   link: PropTypes.string.isRequired,
//   color: PropTypes.string.isRequired,
//   iconClass: PropTypes.string.isRequired,
//   title: PropTypes.string.isRequired,
//   getValue: PropTypes.func.isRequired
// };