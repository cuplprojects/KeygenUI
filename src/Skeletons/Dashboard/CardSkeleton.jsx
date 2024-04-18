import React from 'react'

const CardSkeleton = () => {
  return (
    <div className="col-md-4 col-lg-3 col-sm-6 mb-4">
      <div className="counter skeleton">
        <div className="counter-icon">
          <div className="skeleton-icon"></div>
        </div>
        <div className="counter-value skeleton"></div>
        <div className="skeleton-title"></div>
      </div>
    </div>
  )
}

export default CardSkeleton