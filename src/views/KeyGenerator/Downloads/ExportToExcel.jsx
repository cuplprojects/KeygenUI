import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import ExcelJS from 'exceljs';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faSpinner } from '@fortawesome/free-solid-svg-icons';

const ExportToExcel = ({ data = [], paperData={}, group = "", catchno = "", setlen= 0 }) => {
  const [loading, setLoading] = useState(false);
  const exportToExcel = async () => {
    setLoading(true);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    let chunkedData = [];
    const dividedData = data.reduce((acc, item) => {
      if (acc.length && acc[acc.length - 1].setID === item.setID) {
        acc[acc.length - 1].data.push(item);
      } else {
        acc.push({ setID: item.setID, data: [item] });
      }
      return acc;
    }, chunkedData);
    // A1 
    const answerheadingcell = worksheet.getCell('A1');
    answerheadingcell.value = 'Answer key';
    answerheadingcell.alignment = { horizontal: 'center', vertical: 'middle' };
    answerheadingcell.font = { bold: true, color: { argb: '00000000' } };
    worksheet.getColumn("A").width = 20;
    worksheet.mergeCells(`B1:E1`);
    const paperdetailsheadingcell = worksheet.getCell('B1')
    paperdetailsheadingcell.value = `Catch No. ${catchno}\n${paperData.courseName} ${paperData.examType}  ${paperData.subjectName ? `(${paperData.subjectName})` : ''}\n ${paperData.paperName ? paperData.paperName : ''}`;
    paperdetailsheadingcell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    paperdetailsheadingcell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    paperdetailsheadingcell.style.font.name = 'Arial Narrow';
    paperdetailsheadingcell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF000000' } // Black background color
      };
    paperdetailsheadingcell.width=50;
    worksheet.getRow(1).height = 50;
    const questionnumbercell = worksheet.getCell('A2')
    questionnumbercell.value = 'Question Number';
    questionnumbercell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    questionnumbercell.font = { bold: true, color: { argb: 'FFFF0000' } };
    questionnumbercell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Black background color
    };

    //for h1 
    const answerheadingcellh = worksheet.getCell('H1');
    answerheadingcellh.value = 'Answer key';
    answerheadingcellh.alignment = { horizontal: 'center', vertical: 'middle' };
    answerheadingcellh.font = { bold: true, color: { argb: '00000000' } };

    worksheet.mergeCells(`H1:K1`);
    const paperdetailsheadingcellh = worksheet.getCell('I1')
    paperdetailsheadingcellh.value = `Jumble Chart`;
    paperdetailsheadingcellh.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    paperdetailsheadingcellh.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    paperdetailsheadingcellh.style.font.name = 'Arial Narrow';
    paperdetailsheadingcellh.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF000000' } // Black background color
      };
    paperdetailsheadingcellh.width=50;
    worksheet.getRow(1).height = 50;
    const questionnumbercellh = worksheet.getCell('H2')
    questionnumbercellh.value = 'Question Number';
    questionnumbercellh.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    questionnumbercellh.font = { bold: true, color: { argb: 'FFFF0000' } };
    questionnumbercellh.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Black background color
    };
    
    let tablestart = 66;
    for (let i = 0; i < setlen; i++)
    {
      const tablestartchar = String.fromCharCode(tablestart);
      const tablestartcell = worksheet.getCell(`${tablestartchar}2`)
      tablestartcell.value = `Set ${dividedData[i].setID}`;
      tablestartcell.font = { bold: true, color: { argb: 'FFFF0000' } };
      tablestartcell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Black background color
    };
      
      tablestart = tablestart + 1;
    }

    const dataLength2 = dividedData[0].data.length; //75
    for(let i = 0;i<dataLength2;i++)
    {
      worksheet.getCell(`A${i+3}`).value = i+1
      worksheet.getCell(`A${i+3}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      worksheet.getCell(`A${i+3}`).font = { bold: true, color: { argb: '00000000' } };
    }
    let tablestart2 = 66;
    for (let i = 0; i< setlen; i++)
    {
      const tablestartchar2 = String.fromCharCode(tablestart2);
      let dataLength = dividedData[i].data.length;
      for (let j = 0; j < dataLength; j++)
      {
        worksheet.getCell(`${tablestartchar2}${j+3}`).value = dividedData[i].data[j].answer;
        worksheet.getCell(`${tablestartchar2}${j+3}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        worksheet.getCell(`${tablestartchar2}${j+3}`).font = { bold: true, color: { argb: '00000000' } };
      }
      tablestart2 = tablestart2 + 1;
    }

    for (let row = 1; row <= (dataLength2+2); row++) {
      for (let col = 65; col <= (65+ setlen); col++) {
          const cell = worksheet.getCell(`${String.fromCharCode(col)}${row}`);
          cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
          };
      }
  }

  let tablestartheader = 72;
  for (let i = 0; i < setlen; i++)
  {
    const tablestartchar = String.fromCharCode(tablestartheader);
    const tablestartcell = worksheet.getCell(`${tablestartchar}2`)
    tablestartcell.value = `Set ${dividedData[i].setID}`;
    tablestartcell.font = { bold: true, color: { argb: 'FFFF0000' } };
    tablestartcell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' } // Black background color
  };
    
    tablestartheader = tablestartheader + 1;
  }

  let tablestart3 = 72; // Starting character code (ASCII code for 'H')
  for (let i = 0; i < setlen; i++) {
      const tablestartchar3 = String.fromCharCode(tablestart3);
      let dataLength = dividedData[i].data.length;
      for (let j = 0; j < dataLength; j++) {
          // Find the index of the questionNumber equal to j within dividedData[i].data
          const index = dividedData[i].data.findIndex(item => item.questionNumber === j+1);
  
          worksheet.getCell(`${tablestartchar3}${j+3}`).value =  index+1 ; // Print index or leave cell empty if not found
          worksheet.getCell(`${tablestartchar3}${j+3}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          worksheet.getCell(`${tablestartchar3}${j+3}`).font = { bold: true, color: { argb: '00000000' } };
      }
      tablestart3 += 1; // Move to the next column
  }
  

  for (let row = 1; row <= (dataLength2+2); row++) 
      {
    for (let col = 72; col < (72+ setlen); col++) {
        const cell = worksheet.getCell(`${String.fromCharCode(col)}${row}`);
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };
    }
}
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const excelBlob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(excelBlob, `${catchno}-keys.xlsx`);

    setLoading(false);
  };

  return (
    <Button onClick={exportToExcel} disabled={loading}>
    {loading ? (
         <>
             <FontAwesomeIcon icon={faSpinner} className="me-2" spin /> Loading...
         </>
     ) : (
         <>
             <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Export to Excel<br />With Jumbling Chart
         </>
     )}
 </Button>
  );
};
ExportToExcel.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      setID: PropTypes.string.isRequired,
      pageNumber: PropTypes.number.isRequired,
      questionNumber: PropTypes.number.isRequired,
      answer: PropTypes.string.isRequired
    })
  ),
  setlen: PropTypes.number.isRequired,
  group: PropTypes.string,
  catchno: PropTypes.string,
  paperData: PropTypes.object
};
export default ExportToExcel;
