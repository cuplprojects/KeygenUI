import React from 'react'
import { Placeholder } from 'react-bootstrap'

const SkeletonLoader = () => {
  return (
    <div className="d-flex flex-wrap">
        {Array.from({ length: 15 }).map((_, index) => (
            <div key={index} className="p-1" style={{ flexBasis: '33.33%', maxWidth: '50%' }}>
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={12} className='p-3' />
                </Placeholder>
            </div>
        ))}
    </div>
  )
}

export default SkeletonLoader