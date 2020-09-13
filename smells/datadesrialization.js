const vscode = require('vscode');

var smell = {

    detect : (token) => {
        
        if(token.hasOwnProperty("line")) var lineno = token.line;
        if(token.hasOwnProperty("type")) var tokenType = token.type;
        
        const insecureMethods = ['pickle.loads', 'pickle.load', 'pickle.Unpickler', 'cPickle.loads', 'cPickle.load', 'cPickle.Unpickler', 'marshal.loads', 'marshal.load', 
                                'xml.etree.cElementTree.parse', 'xml.etree.cElementTree.iterparse','xml.etree.cElementTree.fromstring','xml.etree.cElementTree.XMLParser',
                                'xml.etree.ElementTree.parse', 'xml.etree.ElementTree.iterparse', 'xml.etree.ElementTree.fromstring', 'xml.etree.ElementTree.XMLParser',
                                'xml.sax.expatreader.create parser', 'xml.dom.expatbuilder.parse', 'xml.dom.expatbuilder.parseString', 'xml.sax.parse', 'xml.sax.parseString', 
                                'xml.sax.make parser','xml.dom.minidom.parse','xml.dom.minidom.parseString', 'xml.dom.pulldom.parse','xml.dom.pulldom.parseString','lxml.etree.parse',
                                'lxml.etree.fromstring','lxml.etree.RestrictedElement','xml.etree.GlobalParserTLS, lxml.etree.getDefaultParser, lxml.etree.check docinfo'
                            ];

        if(tokenType == "variable")
        {
            if(token.hasOwnProperty("args")) var args = token.args;
            if(token.hasOwnProperty("valueSrc")) var valueSrc = token.valueSrc;
            
            if(insecureMethods.includes(valueSrc) && args.length > 0) 
            {
                const warning = 'possible empty password at line '+ lineno;
                vscode.window.showWarningMessage(warning);
                // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            }
        }
        else if(tokenType == "function_call")
        {
            if(token.hasOwnProperty("args")) var name = token.name;
            if(token.hasOwnProperty("args")) var args = token.args;
            
            if(insecureMethods.includes(name) && args.length > 0) 
            {
                const warning = 'possible empty password at line '+ lineno;
                vscode.window.showWarningMessage(warning);
                // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            }
        }
        else if(tokenType == "function_def")
        {
            if(token.hasOwnProperty("return")) var funcReturn = token.return;
            if(token.hasOwnProperty("returnArgs")) var returnArgs = token.returnArgs;
            
            if(insecureMethods.includes(funcReturn) && returnArgs.length > 0) 
            {
                const warning = 'possible empty password at line '+ lineno;
                vscode.window.showWarningMessage(warning);
                // vscode.commands.executeCommand('revealLine',{'lineNumber':lineno, 'at':'top'});
            }
        }
    }
}

module.exports = smell;