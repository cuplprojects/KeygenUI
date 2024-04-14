import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import ExcelJS from 'exceljs';
import { Button } from 'react-bootstrap';

const ExportToExcel = ({ data = [], group = "", catchno = "", setlen }) => {
  const [loading, setLoading] = useState(false);

  const exportToExcel = async () => {
    setLoading(true);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    let masterheadcolstcount = 65;
    let masterheadcolendcount = 67;
    let chunkedData = [];
    const dividedData = data.reduce((acc, item) => {
      if (acc.length && acc[acc.length - 1].setID === item.setID) {
        acc[acc.length - 1].data.push(item);
      } else {
        acc.push({ setID: item.setID, data: [item] });
      }
      return acc;
    }, chunkedData);

    for (let i = 0; i < setlen; i++) {
      const masterheadercolumnstart = String.fromCharCode(masterheadcolstcount);
      const masterheadercolumnend = String.fromCharCode(masterheadcolendcount);

      worksheet.mergeCells(`${masterheadercolumnstart}1:${masterheadercolumnend}1`);
      const masterHeaderCell = worksheet.getCell(`${masterheadercolumnstart}1`);

      masterHeaderCell.value = `Answer key for Group: ${group}, Catch Number: ${catchno}, Set: ${dividedData[i].setID}`;
      masterHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
      masterHeaderCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      masterHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF000000' } // Black background color
      };

      for (let j = 0; j < 3; j++) {
        const subheadercolcount = masterheadcolstcount + j;
        const subheadercolumn = String.fromCharCode(subheadercolcount);
        worksheet.getColumn(subheadercolumn).width = 10;
        const subheaderCell = worksheet.getCell(`${subheadercolumn}2`);
        subheaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
        subheaderCell.font = { bold: true };
        subheaderCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDADADA' } // Black background color
        };
        subheaderCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (j === 0) {
          subheaderCell.value = 'Page Number';
        } else if (j === 1) {
          subheaderCell.value = 'Question Number';
        } else {
          subheaderCell.value = 'Answer';
        }
      }

      const dataLength = dividedData[i].data.length;
      for (let j = 0; j < dataLength; j++) {
        for (let k = 0; k < 3; k++) {
          const subheadercolcount = masterheadcolstcount + k;
          const subheadercolumn = String.fromCharCode(subheadercolcount);
          const dataItem = dividedData[i].data[j];
          const dataCell = worksheet.getCell(`${subheadercolumn}${j + 3}`);
          dataCell.alignment = { horizontal: 'center', vertical: 'middle' };
          dataCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' } // White background color
          };
          dataCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (k === 0) {
            dataCell.value = dataItem.pageNumber;
          } else if (k === 1) {
            dataCell.value = dataItem.questionNumber;
          } else {
            dataCell.value = dataItem.answer;
          }
        }
      }

      masterheadcolstcount += 4;
      masterheadcolendcount += 4;
    }

    const excelBuffer = await workbook.xlsx.writeBuffer();
    const excelBlob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(excelBlob, `${catchno}.xlsx`);

    setLoading(false);
  };

  return (
    <Button onClick={exportToExcel}>
      {loading ? 'Loading' : 'Export To Excel'}
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
  catchno: PropTypes.string
};
export default ExportToExcel;
