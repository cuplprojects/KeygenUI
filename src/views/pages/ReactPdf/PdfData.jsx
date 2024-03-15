import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import PropTypes from 'prop-types';

const style = StyleSheet.create({
    page: {
        
        padding: '10',
        backgroundColor: 'lightblue'
    },
    section: {border: '2px dashed black',
        margin: 10,
        padding: 10,
    },
    title: {
        textAlign: 'center',
        fontSize: '30px',
        color: 'red',
        borderBottom: '2px solid red',
        margin: '30'
    },
    pagenumber: {
        position: 'absolute',
        fontSize: '12',
        bottom: '10',
        left: '0',
        right: '0',
        textAlign: 'center',
        color: 'grey'
    }
})

const PdfData = ({ data, data2 }) => {
    return (
        <Document>
            <Page size="A4" style={style.page}>
                <View style={style.title}>
                    <Text>Title of the page {data}</Text>
                </View>
                <View style={style.section}>
                    <Text>{data2}</Text>
                </View>
                <Text style={style.pagenumber}
                    render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    )
}

PdfData.propTypes = {
    data: PropTypes.string.isRequired,
    data2: PropTypes.string.isRequired,
};

// ReactPDF.render(<PdfData />, `${__dirname}/example.pdf`);
export default PdfData