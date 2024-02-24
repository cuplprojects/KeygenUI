import React, { useEffect, useRef } from 'react';
import { Table, Button } from 'react-bootstrap';
import $ from 'jquery';
import PropTypes from 'prop-types';

const GroupTable = ({ groups, onViewGroup }) => {
  const tableRef = useRef(null);

  useEffect(() => {
    // Initialize DataTable
    $(tableRef.current).DataTable();
  }, []);

  return (
    <div className='table-responsive hover'>
      <Table bordered hover striped ref={tableRef}>
        <thead>
          <tr>
            <th className='text-center'>Group Name</th>
            <th className='text-center'>Action</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.groupID}>
              <td className='p-2'>{group.groupName}</td>
              <td className='text-center p-2'>
                <Button
                  variant="primary"
                  onClick={() => onViewGroup(group.groupID)}
                  size='sm'
                >
                  View
                </Button>
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
      groupName: PropTypes.string.isRequired
    })
  ).isRequired,
  onViewGroup: PropTypes.func.isRequired
};

export default GroupTable;
