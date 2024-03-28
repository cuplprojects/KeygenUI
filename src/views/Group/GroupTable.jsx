// GroupTable.js
import React, { useEffect, useRef } from 'react';
import { Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import $ from 'jquery';
import { useSecurity } from './../../context/Security';

const GroupTable = ({ groups }) => {
    const { encrypt } = useSecurity();
    const tableRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize DataTable
        $(tableRef.current).DataTable();
      }, []);

      const handleRowClick = (groupID) => {
        navigate(`/Groups/ViewGroup/${encrypt(groupID)}`);
      };
    

    return (
        <div className='table-responsive hover'>
            <Table bordered hover striped ref={tableRef}>
                <thead>
                    <tr>
                        <th className='text-center'>Group ID</th>
                        <th className='text-center'>Group Name</th>
                        <th className='text-center'>Region</th>
                        <th className='text-center'>City</th>
                        <th className='text-center'>Address</th>
                        <th className='text-center'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {groups.map((group) => (
                        <tr className='c-pointer' key={group.groupID} onClick={()=>handleRowClick(group.groupID)}>
                            <td className='p-2'>{group.groupID}</td>
                            <td className='p-2'>{group.groupName}</td>
                            <td className='p-2'>{group.region}</td>
                            <td className='p-2'>{group.city}</td>
                            <td className='p-2'>{group.address}</td>
                            <td className='text-center p-2'>
                                <Link to={`/Groups/ViewGroup/${encrypt(group.groupID)}`}>
                                    <FontAwesomeIcon icon={faEye} />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

GroupTable.propTypes = {
    groups: PropTypes.arrayOf(
        PropTypes.shape({
            groupID: PropTypes.number.isRequired,
            groupName: PropTypes.string.isRequired,
            region: PropTypes.string.isRequired,
            city: PropTypes.string.isRequired,
            address: PropTypes.string.isRequired
        })
    ).isRequired
};

export default GroupTable;
