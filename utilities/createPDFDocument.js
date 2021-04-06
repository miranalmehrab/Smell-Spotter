const fs = require('fs');
const vscode = require('vscode');
const PDFDocument = require('pdfkit');


var createPDFDocument = {
    createPDFDocument: (reportFileName, warnings) => {
        try{
            createPDFDocument.makeSureExportReportDirExists();
            createPDFDocument.removePreviousPDFDocument('smell-spotter/results/'+reportFileName);
            
            let doument = new PDFDocument;
            doument.pipe(fs.createWriteStream('smell-spotter/results/'+reportFileName));
            doument.text(warnings);
            doument.end();
        
        }catch(error){
            console.log(error);
        }
    },
    removePreviousPDFDocument: (fullPath) => fs.unlink(fullPath, (err) =>  err? console.log(err) : ""),
    makeSureExportReportDirExists: () => !fs.existsSync("smell-spotter/results/") ? fs.mkdirSync("smell-spotter/results"): ""
}

module.exports = createPDFDocument;