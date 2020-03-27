const vscode = require('vscode');
const filbert = require('filbert');


/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {

	vscode.window.showInformationMessage('Python file has been loaded!');


	let parsecode = vscode.commands.registerCommand('extension.parsecode', function () 
	{
		const window = vscode.window;
		var docObj = vscode.window.activeTextEditor.document;
		var pcode = docObj.getText();
		const codeLang = docObj.languageId;
		var ast = "";

		if(codeLang === 'python') 
		{
			window.showInformationMessage('Creating AST for pyhton code!');
			if(pcode!=null)
			{
				ast = filbert.parse(pcode);
				window.showInformationMessage('AST created successfully!');
			}
			else window.showErrorMessage("Empty source code!");
			//const ast = filbert.parse(pcode, { locations: true, ranges: true });
		}
		console.log(pcode);
		console.log(ast);
		
	});

	let greetings = vscode.commands.registerCommand('extension.greetings', function()
	{
		vscode.window.showInformationMessage('Hello python programmers!');
	});

	context.subscriptions.push(parsecode);
	context.subscriptions.push(greetings);
}


function interateThroughObject(obj)
{
	for(let key in obj)
	{
		let value = obj[key];
		console.log("key: "+key+" value: "+value);
		vscode.window.showInformationMessage("key: "+key+" value: "+value);
		
		if(typeof value === 'object') interateThroughObject(value);
		else if(Array.isArray(value)) interateThroughObject(value);
	}
}



exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
	//Extension should clean up the resources that it has consumed during operation.

}

module.exports = {
	activate,
	deactivate
}
