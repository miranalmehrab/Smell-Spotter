const fs = require('fs');
const crypto = require('crypto');
const vscode = require('vscode');

var path = require('path');
const store = require('json-fs-store')();
const { spawn } = require('child_process');

var detection = require('./detection/detection');
var createPDFDocument = require('./utilities/createPDFDocument');
var createJsonDocument = require('./utilities/createJsonDocument');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	// vscode.window.showQuickPick.arguments(2);
	// const color = new vscode.ThemeColor('pssd.warning');

	let quickScan = vscode.commands.registerCommand('extension.quickscan', function () {
		
		let fileName = vscode.window.activeTextEditor.document.fileName;  
		let codeLang = vscode.window.activeTextEditor.document.languageId;
		let sourceCode = vscode.window.activeTextEditor.document.getText();
		let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");
				
		if (codeLang === 'python') {
			if (sourceCode != null){		
				analyzeSourceFile(sourceCode, fileName);
				// storeDetectionInDB(fileName, fileHashValue);

				generateReport(fileName);
				
				
				console.log('quick scan normally finished!');
			} else vscode.window.showErrorMessage("Empty source code!");
		} else vscode.window.showErrorMessage("Please select Python source code!");
	});


	let completeScan = vscode.commands.registerCommand('extension.completescan', function () {
		let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.path;
		clearPreviousDetectionLog();

		fs.readdir(workspaceFolder, (err, files) => { 
			if(files){
				files.forEach(file => {
					if(getFileExtension(file) === 'py'){

						let sourceCode = getFileContentsFromPath(path.join(workspaceFolder, file));
						if (sourceCode != null) analyzeSourceFile(sourceCode, file);
						// storeDetectionInDB(fileName, fileHashValue);
						generateReport(file);
						console.log('complete scan normally finished!');
					}
				});
			} else vscode.window.showErrorMessage("Error while reading files!");
		});
	}); 

	// let customScan = vscode.commands.registerCommand('extension.customscan', function () {

	// 	const userPathInput = vscode.window.showInputBox();
	// 	userPathInput.then( userSpecifiedPath => {
			
	// 		if (checkIfFilePath(userSpecifiedPath)){
	// 			if (getFileExtension(userSpecifiedPath) === 'py') {
					
	// 				let pathSplits = userSpecifiedPath.split('/')
	// 				let fileName = pathSplits[pathSplits.length - 1]

	// 				let sourceCode = getFileContentsFromPath(userSpecifiedPath);
	// 				if (sourceCode != null) analyzeSourceFile(sourceCode, fileName);
	// 				else vscode.window.showErrorMessage("Empty source code!");
	// 			}
	// 			else vscode.window.showErrorMessage("Please select Python source code!");
	// 		}
	// 		else{
	// 			fs.readdir(userSpecifiedPath, (err, files) => { 
	// 				if(files){
						
	// 					files.forEach(file => {
	// 						if(getFileExtension(file) === 'py'){

	// 							let sourceCode = getFileContentsFromPath(path.join(userSpecifiedPath, file));
	// 							if (sourceCode != null) analyzeSourceFile(sourceCode, file);
	// 							else vscode.window.showErrorMessage("Empty source code!");
	// 						}
	// 					});
	// 				}
	// 			});
	// 		}
	// 	});
	// }); 

	context.subscriptions.push(quickScan);
	// context.subscriptions.push(customScan);
	context.subscriptions.push(completeScan);
}


const analyzeSourceFile = (sourceCode, fileName) => {

	let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");
	
	store.load(fileHashValue, function(error, object) {
		if(error){
			console.log("Could not find json store data for that file!");
			console.log(error);
			
			const script = spawn('python3.8', [__dirname + '/py/main.py', sourceCode]);
			script.stdout.on('data', data => data ? startSmellInvestigation(data.toString(), fileName): console.log('No data from script!'));
			script.on('close', (exitCode) => exitCode ? console.log(`main script exit code ${exitCode}`) : 'main script exit code not found');
			script.on('error', (err) => console.log(err));
		}
		else showWarningsNotifications(object.warnings);
	});		
}

const getFileContentsFromPath = (userSpecifiedPath) => {
	return fs.readFileSync(userSpecifiedPath, {encoding:'utf8', flag:'r'});
}

// const checkIfFilePath = (value) => {
// 	let pathSplits = value.split("/");
// 	return pathSplits[pathSplits.length - 1].includes(".")? true: false;
// }


const getFileExtension = (value) => {
	let pathSplits = value.split(".");
	return pathSplits[pathSplits.length - 1]? pathSplits[pathSplits.length - 1]: undefined;
}

const showWarningsNotifications = (warnings) => warnings.split("\n").forEach(warning => vscode.window.showWarningMessage(warning));

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

const clearPreviousDetectionLog = () => {
	// fs.writeFileSync(path.join(__dirname, 'project_warnings.csv'), "");

	fs.unlink(path.join(__dirname, 'project_warnings.csv'), (err) => {
		console.log(path.join(__dirname, 'project_warnings.csv') + " was deleted");
		if (err) throw err;
	});	
}

const startSmellInvestigation = (tokens, fileName) => {
	let splittedTokens = tokens.split('\n');
	console.log({'splitted tokens': splittedTokens});
	splittedTokens.pop(); //removing a blank item from array
	
	let importedPackages = getImportedPackagesInSourceCode(splittedTokens);
	detection.detect(fileName, splittedTokens, importedPackages);
}

const storeDetectionInDB = (fileName , hash) => {
	let warningForSingleFile = fs.readFileSync(__dirname+'/warning-logs/single_file_warnings.txt', {encoding:'utf8', flag:'r'});
	let smellLog = {id: hash, name: fileName, warnings: warningForSingleFile};
	store.add(smellLog, (err) => err? console.log(err): "successfully added to store");
}

const generateReport = (fileName) => {

	try {
		let data = fs.readFileSync(__dirname+'/warning-logs/project_warnings.csv');
		console.log({'project warnings ': data.toString()});
		
		// createPDFDocument.createPDFDocument("QuickScanResult.pdf", data, __dirname, fileName);
		// createJsonDocument.createJsonDocument("QuickScanResult.txt", data, __dirname, fileName);
		
		console.log('generate report function executed');
	}
	catch (e) {console.log(e);}
}  



exports.activate = activate;

function deactivate() {
	// this method is called when your extension is deactivated
	//Extension should clean up the resources that it has consumed during operation.
}

module.exports = { activate, deactivate}
