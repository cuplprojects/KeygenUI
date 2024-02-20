import React, { useEffect, useRef } from 'react';
import { Table, Button } from 'react-bootstrap';
import $ from 'jquery'
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
              <td>{group.groupName}</td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => onViewGroup(group.groupID)}
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
      groupID: PropTypes.string.isRequired,
      groupName: PropTypes.string.isRequired
    })
  ).isRequired,
  onViewGroup: PropTypes.func.isRequired
};


export default GroupTable;
