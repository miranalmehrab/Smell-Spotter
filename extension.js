const fs = require('fs');
const vscode = require('vscode'); 

const { spawn } = require('child_process');
var detection = require('./detection/detection');
var createPDFDocument = require('./utilities/createPDFDocument');
const { log } = require('console');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	// const color = new vscode.ThemeColor('pssd.warning');
	// vscode.window.showQuickPick.arguments(2);

	let quickScan = vscode.commands.registerCommand('extension.quickscan', function () {
		
		const sourceCode = vscode.window.activeTextEditor.document.getText();
		const codeLang = vscode.window.activeTextEditor.document.languageId;

		if (codeLang === 'python') {
			if (sourceCode != null) {
				
				const script = spawn('python3.8', [__dirname + '/py/main.py', sourceCode]);

				script.stdout.on('data', data => data? startSmellInvestigation(data.toString()) : console.log('No data from script!'));
				script.on('close', exitCode => exitCode ? console.log(`main script close all stdio with code ${exitCode}`) : 'main script exit code not found');
				script.on('error', err => {
					console.log('Error while traversing AST!')
					console.log(err)
					
				});
			}
			else vscode.window.showErrorMessage("Empty source code!");
		}
		else vscode.window.showErrorMessage("Please select Python source code!");
	});

	context.subscriptions.push(quickScan);
}


const getImportedPackagesInSourceCode = (splittedTokens) => {
	let importedPackages = [];
	splittedTokens.map((token) => {
		
		try{
			let loadedToken = JSON.parse(token)
			if(loadedToken.type == "import") importedPackages.push(loadedToken.og)
		}
		catch(error) {
			vscode.window.showErrorMessage(error.toString())
		}
	})

	return importedPackages;
}


const startSmellInvestigation = (tokens) => {
	fs.writeFileSync(__dirname+'/logs/tokens.txt', tokens);
	
	let tokensFromLog = fs.readFileSync(__dirname+'/logs/tokens.txt', {encoding:'utf8', flag:'r'}); 
	let splittedTokens = tokensFromLog.split('\n');
	splittedTokens.pop()
	
	console.log({'dir name': __dirname});
	console.log(splittedTokens)

	let importedPackages = getImportedPackagesInSourceCode(splittedTokens);
	detection.detect(splittedTokens, importedPackages);

	let warningsFromLog = fs.readFileSync(__dirname+'/logs/warnings.txt', {encoding:'utf8', flag:'r'});
	fs.writeFileSync(__dirname+'/logs/warnings.txt', "");
	createPDFDocument.createDocument("QuickScan.pdf", warningsFromLog, __dirname);
}

exports.activate = activate;

function deactivate() {
	// this method is called when your extension is deactivated
	//Extension should clean up the resources that it has consumed during operation.
}

module.exports = { activate, deactivate}
