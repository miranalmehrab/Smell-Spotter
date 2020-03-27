// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const filbert = require("filbert");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pssd" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.parsecode', function () 
	{
		console.log('parsecode method is executed!');
		const pcode = "print('Hello world!')";
		const ast = filbert.parse(pcode);
		console.log(ast.body[0].expression.arguments[0].value);

		vscode.window.showInformationMessage('Your code is being parsed!');
		vscode.window.showInformationMessage('0 smell found code!');
	
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {


}

module.exports = {
	activate,
	deactivate
}
