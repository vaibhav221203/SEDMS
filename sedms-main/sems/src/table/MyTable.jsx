import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, styled } from '@mui/material';
import './table.css';

const StyledButton2 = styled(Button)({
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: 'rgb(190,206,234)',
  color: 'black',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '5px',
  marginLeft: '28%'
});

function MyTable() {
  const [tableData, setTableData] = useState([]); // Initialize as an empty array
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from your backend API (replace with your actual API endpoint)
    fetch('http://localhost:3000/data_of_equip_avai')
      .then((response) => response.json())
      .then((result) => {
        console.log('API response:', result); // Log the API response
        if (Array.isArray(result)) {
          setTableData(result); // Set the entire result if it's an array
        } else {
          console.error('API response is not an array:', result);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <>
      <h2>Sports Equipment Database Management System</h2>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Equipment Name</th>
              <th>Total</th>
              <th>Available</th>
              <th>Taken</th>
              <th>Remaining</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(tableData) && tableData.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>{row.equipment_name}</td>
                <td>{row.total}</td>
                <td>{row.available}</td>
                <td>{row.taken}</td>
                <td>{row.remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <StyledButton2 variant="contained" onClick={() => navigate("/scannerform")}>Borrow</StyledButton2>
        <StyledButton2 variant="contained" onClick={() => navigate("/return_page")}>Return</StyledButton2>
      </div>
    </>
  );
}

export default MyTable;
