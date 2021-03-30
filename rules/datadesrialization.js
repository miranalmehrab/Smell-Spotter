const fs = require('fs');
const vscode = require('vscode');

var smell = {

    detect : (fileName, token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;

        const MSG = 'possible insecure deserialization'
        
        const WARNING_MSG = MSG+' at line '+ lineno;
        const WARNING_MSG_ON_RETURN = token.hasOwnProperty("returnLine") ? WARNING_MSG+ token.returnLine : null;

        const insecureMethods = ['pickle.loads', 'pickle.load', 'pickle.Unpickler', 'cPickle.loads', 'cPickle.load', 'cPickle.Unpickler', 'marshal.loads', 'marshal.load', 
                                'xml.etree.cElementTree.parse', 'xml.etree.cElementTree.iterparse','xml.etree.cElementTree.fromstring','xml.etree.cElementTree.XMLParser',
                                'xml.etree.ElementTree.parse', 'xml.etree.ElementTree.iterparse', 'xml.etree.ElementTree.fromstring', 'xml.etree.ElementTree.XMLParser',
                                'xml.sax.expatreader.create parser', 'xml.dom.expatbuilder.parse', 'xml.dom.expatbuilder.parseString', 'xml.sax.parse', 'xml.sax.parseString', 
                                'xml.sax.make parser','xml.dom.minidom.parse','xml.dom.minidom.parseString', 'xml.dom.pulldom.parse','xml.dom.pulldom.parseString','lxml.etree.parse',
                                'lxml.etree.fromstring','lxml.etree.RestrictedElement','xml.etree.GlobalParserTLS, lxml.etree.getDefaultParser, lxml.etree.check docinfo'
                            ];

        if(tokenType == "variable"){
            if(token.hasOwnProperty("valueSrc")){
                if(insecureMethods.includes(token.valueSrc)) 
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            }
        }
        else if(tokenType == "function_call"){
            if(token.hasOwnProperty("name")){
                if(insecureMethods.includes(token.name)) 
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);
            }

            if(token.hasOwnProperty("args") && token.args.length > 0){
                token.args.forEach(arg => {
                    if(insecureMethods.includes(arg)) 
                    smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG);        
                });
            }

        }
        else if(tokenType == "function_def"){
            if(token.hasOwnProperty("return") && token.return != null){
                for(const funcReturn of token.return){
                    if(insecureMethods.includes(funcReturn)) {
                        smell.triggerAlarm (fileName, MSG, lineno, WARNING_MSG_ON_RETURN);
                        // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
                    }
                }
            }
        }
    },
    
    triggerAlarm: (fileName, MSG, lineno, WARNING_MSG) => {
        let backslashSplittedFilePathLength = fileName.split("/").length
        let filenameFromPath = fileName.split("/")[backslashSplittedFilePathLength - 1]
        
        vscode.window.showWarningMessage(MSG +" : "+ filenameFromPath+":"+lineno)
        console.log( "\u001b[1;31m"+"warning: "+MSG +"  location:"+ fileName+":"+lineno)
        fs.appendFileSync(__dirname+'/../warning-logs/project_warnings.csv', fileName+","+WARNING_MSG+"\n")    
    }
}

module.exports = smell;