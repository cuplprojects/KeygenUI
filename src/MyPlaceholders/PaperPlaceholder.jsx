import React from 'react'
import { Placeholder } from 'react-bootstrap'

const PaperPlaceholder = () => {
    return (
        <div className="d-flex flex-wrap">
            {Array.from({ length: 45 }).map((_, index) => (
                <div key={index} className="p-1" style={{ flexBasis: '11%', maxWidth: '50%' }}>
                    <Placeholder as="div" animation="glow">
                        <Placeholder xs={12} className='p-3' />
                    </Placeholder>
                </div>
            ))}
        </div>
    )
}

export default PaperPlaceholder