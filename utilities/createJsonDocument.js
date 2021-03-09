const fs = require('fs');
const { log } = require('console'); 


var createJsonDocument = {

    createJsonDocument: (documentName, detectionResults, pathName) => {
        
        createJsonDocument.removePreviousJsonDocument(pathName+'/'+documentName);
        console.log({"createJsonDocument": "working"});
        detectionResults = detectionResults.split("\n");
        detectionResults.pop();
        
        console.log({'detectionResults': detectionResults});

        let warnings = detectionResults.slice(1);
        let sourceCodeFileName = detectionResults[0].split(":")[1];  
        let singleSourceCodeResult = {"filename": sourceCodeFileName, "warnings": warnings};

        let jsonSingleSourceCodeResult = JSON.stringify(singleSourceCodeResult);
        console.log({"jsonSingleSourceCodeResult": jsonSingleSourceCodeResult});
        
        fs.writeFileSync(pathName+'/'+documentName, jsonSingleSourceCodeResult);
        
    },

    removePreviousJsonDocument: (fullPath) => {
        fs.unlink(fullPath, (err) => {
            if (err) throw err;
            console.log(fullPath+' was deleted');
        });
    }
}

module.exports = createJsonDocument;