const fs = require('fs');
const { log } = require('console');
const PDFDocument = require('pdfkit');


var createPDFDocument = {
    createPDFDocument: (documentName, detectionResults, pathName) => {
        createPDFDocument.removePreviousPDFDocument(pathName+'/'+documentName);
        console.log({"createPDFDocument": "working"});

        let doument = new PDFDocument;
        doument.pipe(fs.createWriteStream(pathName+'/'+documentName));
        doument.text(detectionResults);
        doument.end();
    },

    removePreviousPDFDocument: (fullPath) => {
        fs.unlink(fullPath, (err) => {
            if (err) throw err;
            console.log(fullPath+' was deleted');
        });
    }
}

module.exports = createPDFDocument;