const fs = require('fs');

var createJsonDocument = {
    createJsonDocument: (resultDocumentName, detectionResults, pathName,fileName) => {
        createJsonDocument.removePreviousJsonDocument(pathName+'/'+resultDocumentName);
        detectionResults = detectionResults.split("\n");
        
        detectionResults.pop();

        let warnings = detectionResults.slice(1);
        let singleSourceCodeResult = {"filename": fileName, "warnings": warnings};

        let jsonSingleSourceCodeResult = JSON.stringify(singleSourceCodeResult);
        fs.writeFileSync(pathName+'/'+resultDocumentName, jsonSingleSourceCodeResult);
    },

    removePreviousJsonDocument: (fullPath) => {
        fs.unlink(fullPath, (err) => {
            if (err) throw err;
            console.log(fullPath+' was deleted');
        });
    }
}

module.exports = createJsonDocument;