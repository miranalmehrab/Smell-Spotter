const fs = require('fs');
const vscode = require('vscode');
const { spawn } = require('child_process');
var detection = require('./detection/detection');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	// const color = new vscode.ThemeColor('pssd.warning');
	let parsecode = vscode.commands.registerCommand('extension.parsecode', function () {

		const pcode = vscode.window.activeTextEditor.document.getText();
		const codeLang = vscode.window.activeTextEditor.document.languageId;

		if (codeLang === 'python') {
			if (pcode != null) {
				
				const script = spawn('python3.8', [__dirname + '/py/main.py', pcode]);
				script.stdout.on('data', data => data? startDetection(data.toString()) : console.log('No data from script!'));

				script.on('close', code => code ? console.log(`main script close all stdio with code ${code}`) : 'main script exit code not found');
			}
			else vscode.window.showErrorMessage("Empty source code!");
		}
		else vscode.window.showErrorMessage("Please select python source code!");
	});

	context.subscriptions.push(parsecode);
}

const startDetection = tokens => {
	fs.writeFileSync(__dirname+'/logs/tokens.txt', tokens);
	
	const data = fs.readFileSync(__dirname+'/logs/tokens.txt', {encoding:'utf8', flag:'r'}); 
	detection.detect(data.split('\n'))
} 

exports.activate = activate;

function deactivate() {
	// this method is called when your extension is deactivated
	//Extension should clean up the resources that it has consumed during operation.
}

module.exports = { activate, deactivate}
