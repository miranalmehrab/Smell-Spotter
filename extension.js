const fs = require('fs');
const crypto = require('crypto');
const vscode = require('vscode');

var path = require('path');
const store = require('json-fs-store')();

// const { log } = require('console');
const { spawn } = require('child_process');

var detection = require('./detection/detection');
var createPDFDocument = require('./utilities/createPDFDocument');
var createJsonDocument = require('./utilities/createJsonDocument');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	// const color = new vscode.ThemeColor('pssd.warning');
	// vscode.window.showQuickPick.arguments(2);

	
	let quickScan = vscode.commands.registerCommand('extension.quickscan', function () {
		
		let fileName = vscode.window.activeTextEditor.document.fileName;  
		let codeLang = vscode.window.activeTextEditor.document.languageId;
		let sourceCode = vscode.window.activeTextEditor.document.getText();

		if (codeLang === 'python') {
			if (sourceCode != null) analyzeSourceFile(sourceCode, fileName);
			else vscode.window.showErrorMessage("Empty source code!");
		}
		else vscode.window.showErrorMessage("Please select Python source code!");
	});


	let completeScan = vscode.commands.registerCommand('extension.completescan', function () {
		let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.path;
		console.log({'workspaceFolder': workspaceFolder});

		console.log({'type of workspaceFolder': typeof(workspaceFolder)});

		fs.readdir(workspaceFolder, (err, files) => { 
			if(files){
				
				files.forEach(file => {
					if(getFileExtension(file) === 'py'){

						let sourceCode = getFileContentsFromPath(path.join(workspaceFolder, file));
						if (sourceCode != null) analyzeSourceFile(sourceCode, file);
						else vscode.window.showErrorMessage("Empty source code!");
					}
				});
			}
		});
	}); 

	let customScan = vscode.commands.registerCommand('extension.customscan', function () {

		const userPathInput = vscode.window.showInputBox();
		userPathInput.then( userSpecifiedPath => {
			
			if (checkIfFilePath(userSpecifiedPath)){
				if (getFileExtension(userSpecifiedPath) === 'py') {
					
					let pathSplits = userSpecifiedPath.split('/')
					let fileName = pathSplits[pathSplits.length - 1]

					let sourceCode = getFileContentsFromPath(userSpecifiedPath);
					if (sourceCode != null) analyzeSourceFile(sourceCode, fileName);
					else vscode.window.showErrorMessage("Empty source code!");
				}
				else vscode.window.showErrorMessage("Please select Python source code!");
			}
			else{
				fs.readdir(userSpecifiedPath, (err, files) => { 
					if(files){
						
						files.forEach(file => {
							if(getFileExtension(file) === 'py'){

								let sourceCode = getFileContentsFromPath(path.join(userSpecifiedPath, file));
								if (sourceCode != null) analyzeSourceFile(sourceCode, file);
								else vscode.window.showErrorMessage("Empty source code!");
							}
						});
					}
				});
			}
		});
	}); 

	context.subscriptions.push(quickScan);
	context.subscriptions.push(customScan);
	context.subscriptions.push(completeScan);
}


const analyzeSourceFile = (sourceCode, fileName) => {

	let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");
	store.load(fileHashValue, function(err,object) {

		if(err){
			console.log(err);
			const script = spawn('python3.8', [__dirname + '/py/main.py', sourceCode]);
			script.stdout.on('data', data => data ? startSmellInvestigation(fileName, data.toString(), fileHashValue) : console.log('No data from script!'));
			script.on('close', (exitCode) => exitCode ? console.log(`main script exit code ${exitCode}`) : 'main script exit code not found');
			script.on('error', (err) => console.log(err));
		}
		else showWarningsNotifications(object.warnings);
	});		
}

const getFileContentsFromPath = (userSpecifiedPath) => {
	return fs.readFileSync(userSpecifiedPath, {encoding:'utf8', flag:'r'});
}

const checkIfFilePath = (value) => {
	let pathSplits = value.split("/");
	return pathSplits[pathSplits.length - 1].includes(".")? true: false;
}


const getFileExtension = (value) => {
	let pathSplits = value.split(".");
	return pathSplits[pathSplits.length - 1]? pathSplits[pathSplits.length - 1]: undefined;
}

const showWarningsNotifications = (previousWarnings) => {
	console.log({'warnings': 'previous results'});
	let warnings = previousWarnings.split("\n");
	// warnings.pop();

	warnings.forEach(warning => {
		vscode.window.showWarningMessage(warning);
	});
}

const getImportedPackagesInSourceCode = (splittedTokens) => {
	let importedPackages = [];
	splittedTokens.map((token) => {
		
		try {
			let loadedToken = JSON.parse(token)
			if(loadedToken.type == "import") importedPackages.push(loadedToken.og)
		}
		catch(error) { vscode.window.showErrorMessage(error.toString())}
	})
	return importedPackages;
}

const clearLogContents = () => {
	try {
		fs.writeFileSync(__dirname+'/logs/tokens.txt', "");
		fs.writeFileSync(__dirname+'/logs/warnings.txt', "");
		
  	} catch(err) { console.error(err)}
}

const startSmellInvestigation = (fileName = undefined, tokens, hash) => {
	clearLogContents();
	
	fs.writeFileSync(__dirname+'/logs/tokens.txt', tokens);
	let tokensFromLog = fs.readFileSync(__dirname+'/logs/tokens.txt', {encoding:'utf8', flag:'r'}); 
	let splittedTokens = tokensFromLog.split('\n');

	console.log({'splitted tokens': splittedTokens});
	// splittedTokens.pop(); //removing a blank item from array
	
	let importedPackages = getImportedPackagesInSourceCode(splittedTokens);
	detection.detect(splittedTokens, importedPackages);
	exportDetectionResult(fileName, hash);

}

const exportDetectionResult = (fileName, hash) => {
	let warningsFromLog = fs.readFileSync(__dirname+'/logs/warnings.txt', {encoding:'utf8', flag:'r'});
	warningsFromLog = fileName != undefined? "filename: "+ fileName +"\n"+ warningsFromLog : "filename: " + "No name found\n" + warningsFromLog;
	
	console.log({fileName: fileName});
	console.log({"warningsFromLog": warningsFromLog});

	var log = {id: hash, name: fileName, warnings: warningsFromLog};
	
	store.add(log, function(err) {
		if (err) console.log(err); 
	});

	createPDFDocument.createPDFDocument("QuickScan.pdf", warningsFromLog, __dirname);
	console.log({"createPDFDocument": "came back"});
	
	createJsonDocument.createJsonDocument("QuickScan.json", warningsFromLog, __dirname);
	console.log({"createJsonDocument": "came back"});
}



exports.activate = activate;

function deactivate() {
	// this method is called when your extension is deactivated
	//Extension should clean up the resources that it has consumed during operation.
}

module.exports = { activate, deactivate}
