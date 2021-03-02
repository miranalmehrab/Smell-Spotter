const { log } = require('console');
const fs = require('fs');
const PDFDocument = require('pdfkit');


var createPDFDocument = {
    createDocument: (documentName, detectionResults, pathName) => {
        createPDFDocument.removePreviousPDF(pathName+'/'+documentName);

        let doument = new PDFDocument;
        doument.pipe(fs.createWriteStream(pathName+'/'+documentName));
        doument.text(detectionResults);
        doument.end();
    },

    removePreviousPDF: (fullPath) => {
        fs.unlink(fullPath, (err) => {
            if (err) throw err;
            console.log(fullPath+' was deleted');
        });
    }
}

module.exports = createPDFDocument;