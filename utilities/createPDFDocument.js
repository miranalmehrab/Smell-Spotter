const fs = require('fs');
const vscode = require('vscode');
const PDFDocument = require('pdfkit');


var createPDFDocument = {
    createPDFDocument: (resultDocumentName, detectionResults, pathName, outputChannel) => {
        try{
            if (!fs.existsSync(pathName+'/results/')){
                fs.mkdirSync(pathName+'/results/');
            }
            
            createPDFDocument.removePreviousPDFDocument(pathName+'/results/'+resultDocumentName);
            // console.log({"result location": pathName+'/results/'+resultDocumentName});
            
            let results = createPDFDocument.processDetectionResults(detectionResults);

            let doument = new PDFDocument;
            doument.pipe(fs.createWriteStream(pathName+'/results/'+resultDocumentName));
            doument.text(results.join("\n"));
            doument.end();

            outputChannel.append("\n"+"exported report can be found here: /" + pathName+'/results/'+resultDocumentName);
            
        
        }catch(error){
            console.log(error);
        }
    },

    removePreviousPDFDocument: (fullPath) => {
        fs.unlink(fullPath, (err) => {
            if (err) console.log(err);
            // else console.log(fullPath+' was deleted');
        });
    },

    processDetectionResults: (results) => {
        results.forEach(result => {
            if(result.includes("filename")) result = "\n" +result +"\n";
        });

        return results;
    }
}

module.exports = createPDFDocument;