import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import ExcelJS from 'exceljs';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faSpinner } from '@fortawesome/free-solid-svg-icons';

const Excel75intworows = ({ data = [], paperData = {}, group = "", catchno = "", setlen = 0 }) => {
  const [loading, setLoading] = useState(false);
  const fs = 12.2; // Font size

  const exportToExcel = async () => {
    setLoading(true);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Repeat first two rows on every printed page
    worksheet.pageSetup.printTitlesRow = '1:2';

    let chunkedData = [];
    const dividedData = data.reduce((acc, item) => {
      if (acc.length && acc[acc.length - 1].setID === item.setID) {
        acc[acc.length - 1].data.push(item);
      } else {
        acc.push({ setID: item.setID, data: [item] });
      }
      return acc;
    }, chunkedData);

    // A1:E1 Headers
    worksheet.mergeCells(`A1:E1`);
    const paperdetailsheadingcell = worksheet.getCell('B1');
    paperdetailsheadingcell.value = `Catch No. ${catchno}\n${paperData.courseName} ${paperData.examType} ${paperData.subjectName ? `(${paperData.subjectName})` : ''}\n ${paperData.paperName ? paperData.paperName : ''}`;
    paperdetailsheadingcell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    paperdetailsheadingcell.font = { bold: true, color: { argb: 'FFFFFFFF' }  }; // Increased font size
    paperdetailsheadingcell.style.font.name = 'Arial Narrow';
    paperdetailsheadingcell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF000000' } // Black background color
    };
    worksheet.getRow(1).height = 50;

    // A2:E2 Headers
    const questionnumbercell = worksheet.getCell('A2');
    questionnumbercell.value = 'Q.N.';
    questionnumbercell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    questionnumbercell.font = { bold: true, color: { argb: 'FFFF0000' },  size: fs }; // Increased font size
    questionnumbercell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Yellow background color
    };

    let tablestart = 66;
    for (let i = 0; i < setlen; i++) {
      const tablestartchar = String.fromCharCode(tablestart);
      const tablestartcell = worksheet.getCell(`${tablestartchar}2`);
      tablestartcell.value = `Set ${dividedData[i].setID}`;
      tablestartcell.font = { bold: true, color: { argb: 'FFFF0000' },  size: fs }; // Increased font size
      tablestartcell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' } // Yellow background color
      };
      tablestart = tablestart + 1;
    }

    const dataLength2 = dividedData[0].data.length;
    console.log(dataLength2);

    // Place the first 38 entries starting from column A
    for (let i = 0; i < Math.min(dataLength2, 38); i++) {
      worksheet.getCell(`A${i + 3}`).value = i + 1;
      worksheet.getCell(`A${i + 3}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      worksheet.getCell(`A${i + 3}`).font = { bold: true, color: { argb: '00000000' },  size: fs }; // Increased font size
    }

    let tablestart2 = 66;
    for (let i = 0; i < setlen; i++) {
      const tablestartchar2 = String.fromCharCode(tablestart2);
      let dataLength = dividedData[i].data.length;
      for (let j = 0; j < Math.min(dataLength, 38); j++) {
        worksheet.getCell(`${tablestartchar2}${j + 3}`).value = dividedData[i].data[j].answer;
        worksheet.getCell(`${tablestartchar2}${j + 3}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        worksheet.getCell(`${tablestartchar2}${j + 3}`).font = { bold: true, color: { argb: '00000000' },  size: fs }; // Increased font size
      }
      tablestart2 = tablestart2 + 1;
    }

    // Repeat headers in H1:K1 and H2:K2
    worksheet.mergeCells(`G1:K1`);
    const repeatedPaperDetailsHeading = worksheet.getCell('G1');
    repeatedPaperDetailsHeading.value = `Catch No. ${catchno}\n${paperData.courseName} ${paperData.examType} ${paperData.subjectName ? `(${paperData.subjectName})` : ''}\n ${paperData.paperName ? paperData.paperName : ''}`;
    repeatedPaperDetailsHeading.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    repeatedPaperDetailsHeading.font = { bold: true, color: { argb: 'FFFFFFFF' }  }; // Increased font size
    repeatedPaperDetailsHeading.style.font.name = 'Arial Narrow';
    repeatedPaperDetailsHeading.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF000000' } // Black background color
    };

    const repeatedQuestionNumberCell = worksheet.getCell('G2');
    repeatedQuestionNumberCell.value = 'Q.N.';
    repeatedQuestionNumberCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    repeatedQuestionNumberCell.font = { bold: true, color: { argb: 'FFFF0000' },  size: fs }; // Increased font size
    repeatedQuestionNumberCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Yellow background color
    };

    tablestart = 72 ; // Start from column I
    for (let i = 0; i < setlen; i++) {
      const tablestartchar = String.fromCharCode(tablestart);
      const tablestartcell = worksheet.getCell(`${tablestartchar}2`);
      tablestartcell.value = `Set ${dividedData[i].setID}`;
      tablestartcell.font = { bold: true, color: { argb: 'FFFF0000' },  size: fs }; // Increased font size
      tablestartcell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' } // Yellow background color
      };
      tablestart = tablestart + 1;
    }

    // Place the remaining entries starting from H3
    if (dataLength2 > 38) {
      for (let i = 38; i < dataLength2; i++) {
        worksheet.getCell(`G${i - 35}`).value = i + 1;
        worksheet.getCell(`G${i - 35}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        worksheet.getCell(`G${i - 35}`).font = { bold: true, color: { argb: '00000000' },  size: fs }; // Increased font size
      }

      tablestart2 = 72; // Start from column I
      for (let i = 0; i < setlen; i++) {
        const tablestartchar2 = String.fromCharCode(tablestart2);
        let dataLength = dividedData[i].data.length;
        for (let j = 38; j < dataLength; j++) {
          worksheet.getCell(`${tablestartchar2}${j - 35}`).value = dividedData[i].data[j].answer;
          worksheet.getCell(`${tablestartchar2}${j - 35}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          worksheet.getCell(`${tablestartchar2}${j - 35}`).font = { bold: true, color: { argb: '00000000' },  size: fs }; // Increased font size
        }
        tablestart2 = tablestart2 + 1;
      }
    }

    // Add borders to all cells
    for (let row = 1; row <= (Math.min(dataLength2, 38) + 2); row++) {
      for (let col = 65; col <= (65 + setlen); col++) {
        const cell = worksheet.getCell(`${String.fromCharCode(col)}${row}`);
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      }
    }

    // Add borders to H side cells
    for (let row = 1; row <= (Math.min(dataLength2, 37) + 2); row++) {
      for (let col = 71; col <= (71 + setlen); col++) {
        const cell = worksheet.getCell(`${String.fromCharCode(col)}${row}`);
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      }
    }

    // Set column widths
    worksheet.columns = Array.from({ length: 71 + setlen }, (_, i) => ({
      width: 7.5 // Adjust the width as needed
    }));

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
          <FontAwesomeIcon icon={faFileExcel} className="me-2" /> 75 in Two-rows
        </>
      )}
    </Button>
  );
};

Excel75intworows.propTypes = {
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

export default Excel75intworows;
