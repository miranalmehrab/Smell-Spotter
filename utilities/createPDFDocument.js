const fs = require('fs');
const PDFDocument = require('pdfkit');


var createPDFDocument = {
    createPDFDocument: (resultDocumentName, detectionResults, pathName) => {
        createPDFDocument.removePreviousPDFDocument(pathName+'/results/'+resultDocumentName);
        
        let doument = new PDFDocument;
        doument.pipe(fs.createWriteStream(pathName+'/results/'+resultDocumentName));
        doument.text(detectionResults.join("\n"));
        doument.end();
    },

    removePreviousPDFDocument: (fullPath) => {
        fs.unlink(fullPath, (err) => {
            if (err) throw err;
            // console.log(fullPath+' was deleted');
        });
    }
}

module.exports = createPDFDocument;