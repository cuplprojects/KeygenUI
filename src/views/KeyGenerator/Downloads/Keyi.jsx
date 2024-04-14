import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import PropTypes from 'prop-types';

const style = StyleSheet.create({
    page: {
        padding: 10,
        fontSize: 9.4,
        boxSizing: 'border-box',
        textAlign: 'center'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
        flexDirection: 'row',
    },
    pagetitle: {
        textAlign: 'center',
        fontSize: '15px',
        marginBottom: '-10px'
    },
    settable: {
        border: '1px solid black',
        flex: 1
    },
    settitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        borderBottom: 1,
        borderBottomColor: 'black'
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottom: '1px solid black',
        paddingBottom: 2,
    },
    columnHeader: {
        flex: 1,
        fontWeight: 'bold',
        borderRight: '0.5px solid black'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: 1,
        borderColor: 'black',
        paddingTop: 2,
        paddingBottom: 2,
    },
    column: {
        flex: 1,
        borderColor: '1px solid black',
        paddingRight: 8,
        textAlign: 'center',
        borderRight: '0.5px solid black'
    },
    pagenumber: {
        position: 'absolute',
        fontSize: 12,
        bottom: 10,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'grey',
    },
});

const Keyi = ({ data = [], group = '', catchno = '', sn = '' }) => {
    if (!data) {
        return null; // If data is null, return null to prevent rendering
    }

    // Group the data by setID
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.setID]) {
            acc[item.setID] = [];
        }
        acc[item.setID].push(item);
        return acc;
    }, {});

    // Get the maximum number of questions in a set
    const maxQuestions = Math.max(...Object.values(groupedData).map((set) => set.length));

    return (
        <Document>
            <Page size="A4" style={style.page}>
                <Text style={style.pagetitle}>Group: {group} & Catch Number: {catchno}</Text>
                <View style={style.section}>
                    {Object.entries(groupedData).map(([setID, setData]) => (
                        <View key={setID} style={style.settable}>
                            <Text style={style.settitle}>Set {setID}</Text>
                            <View style={style.tableHeader}>
                                <Text style={style.columnHeader}>Sn</Text>
                                <Text style={style.columnHeader}>Answer</Text>
                            </View>
                            {setData.map((item, index) => (
                                <View key={index} style={style.tableRow}>
                                    <Text style={style.column}>{index + 1}</Text>
                                    <Text style={style.column}>{item.answer}</Text>
                                </View>
                            ))}
                            {/* Add empty rows to match the max number of questions */}
                            {Array.from({ length: maxQuestions - setData.length }).map((_, index) => (
                                <View key={`empty-${index}`} style={style.tableRow}>
                                    <Text style={style.column}>&nbsp;</Text>
                                    <Text style={style.column}>&nbsp;</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
                <Text style={style.pagenumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} fixed />
            </Page>
        </Document>
    );
};

Keyi.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            setID: PropTypes.string.isRequired,
            pageNumber: PropTypes.number.isRequired,
            questionNumber: PropTypes.number.isRequired,
            answer: PropTypes.string.isRequired
        })
    ),
    group: PropTypes.string,
    catchno: PropTypes.string,
    sn: PropTypes.string,
};

export default Keyi;
