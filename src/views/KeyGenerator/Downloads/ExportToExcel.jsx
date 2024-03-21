import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import ExcelJS from 'exceljs';
import { Button } from 'react-bootstrap';

const ExportToExcel = ({ data, group, catchno }) => {
    const [loading, setLoading] = useState(false);

    const exportToExcel = async () => {
        setLoading(true);

        const workbook = new ExcelJS.Workbook();

        // Group data by setID
        const groupedData = data.reduce((acc, item) => {
            if (!acc[item.setID]) {
                acc[item.setID] = [];
            }
            acc[item.setID].push(item);
            return acc;
        }, {});

        // Iterate over each setID
        Object.entries(groupedData).forEach(([setID, setData]) => {
            const sheet = workbook.addWorksheet(`Set ${setID}`);

            // Add group name row
            // Add group name row (fixed)
            const groupRow = sheet.addRow([`${group} & Catch No: ${catchno} & Set ID: ${setID}`]);
            groupRow.eachCell((cell) => {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.font = { color: { argb: 'FFFFFFFF' } }; // Set text color to white
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } }; // Set background color to black
                cell.border = {
                    top: { style: 'thin', color: { argb: '00000000' } },
                    left: { style: 'thin', color: { argb: '00000000' } },
                    bottom: { style: 'thin', color: { argb: '00000000' } },
                    right: { style: 'thin', color: { argb: '00000000' } },
                };
            });
            sheet.mergeCells(`A${sheet.lastRow.number}:C${sheet.lastRow.number}`);
            groupRow.state = { state: 'frozen', ySplit: 2 };

            // Add headers row (fixed)
            const headersRow = sheet.addRow(['Page Number', 'Question Number', 'Answer']);
            headersRow.eachCell((cell) => {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.font = { color: { argb: '000' } }; // Set text color to white
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'dadada' } };
                cell.border = {
                    top: { style: 'thin', color: { argb: '00000000' } },
                    left: { style: 'thin', color: { argb: '00000000' } },
                    bottom: { style: 'thin', color: { argb: '00000000' } },
                    right: { style: 'thin', color: { argb: '00000000' } },
                };
            });
            headersRow.state = { state: 'frozen', ySplit: 2 };

            // Add data rows for the current setID
            setData.forEach((item) => {
                const dataRow = sheet.addRow([item.pageNumber, item.questionNumber, item.answer]);
                dataRow.eachCell((cell) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.border = {
                        top: { style: 'thin', color: { argb: '00000000' } },
                        left: { style: 'thin', color: { argb: '00000000' } },
                        bottom: { style: 'thin', color: { argb: '00000000' } },
                        right: { style: 'thin', color: { argb: '00000000' } },
                    };
                });
            });

            // Set column widths
            sheet.columns.forEach((column) => {
                column.width = 20; // Set the width of all columns to 20
            });
        });

        // Write workbook to buffer and download
        const excelBuffer = await workbook.xlsx.writeBuffer();
        const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
    data: PropTypes.arrayOf(PropTypes.shape({
        setID: PropTypes.number.isRequired,
        pageNumber: PropTypes.number.isRequired,
        questionNumber: PropTypes.number.isRequired,
        answer: PropTypes.string.isRequired,
    })).isRequired,
    group: PropTypes.string.isRequired,
    catchno: PropTypes.string.isRequired,
};

export default ExportToExcel;
