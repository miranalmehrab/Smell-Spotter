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
		
		clearPreviousDetectionLog();
		let fileName = vscode.window.activeTextEditor.document.fileName;  
		let codeLang = vscode.window.activeTextEditor.document.languageId;
		let sourceCode = vscode.window.activeTextEditor.document.getText();
		let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");
				
		if (codeLang === 'python') {
			if (sourceCode != null){		
				analyzeSourceFile(sourceCode, fileName);
				setTimeout(storeDetectionInDB, 4000, fileName, fileHashValue);
				setTimeout(generateReport, 4000, fileName);
				
				console.log('quick scan normally finished!');
			} else vscode.window.showErrorMessage("Empty source code!");
		} else vscode.window.showErrorMessage("Please select Python source code!");
	});


	let completeScan = vscode.commands.registerCommand('extension.completescan', function () {
		clearPreviousDetectionLog();
		let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.path;
		
		fs.readdir(workspaceFolder, (err, files) => { 
			if(files){
				files.forEach(file => {
					if(getFileExtension(file) === 'py'){

						let sourceCode = getFileContentsFromPath(path.join(workspaceFolder, file));
						let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");

						if (sourceCode != null) {
							analyzeSourceFile(sourceCode, path.join(workspaceFolder, file));
							setTimeout(storeDetectionInDB, 4000, file, fileHashValue);
							
							console.log('complete scan normally finished!');
						}
					}
				});
			} else vscode.window.showErrorMessage("Error while reading files!");
			setTimeout(generateReport, 4000, undefined);
		});
	}); 

	let customScan = vscode.commands.registerCommand('extension.customscan', function () {
		clearPreviousDetectionLog();
		const userPathInput = vscode.window.showInputBox();
		userPathInput.then( userSpecifiedPath => {
			
			if (checkIfFilePath(userSpecifiedPath)){
				if (getFileExtension(userSpecifiedPath) === 'py') {
					
					let pathSplits = userSpecifiedPath.split('/')
					let fileName = pathSplits[pathSplits.length - 1]

					let sourceCode = getFileContentsFromPath(userSpecifiedPath);
					if (sourceCode != null) {
						analyzeSourceFile(sourceCode, userSpecifiedPath);
						setTimeout(storeDetectionInDB, 4000, fileName, userSpecifiedPath);
						setTimeout(generateReport, 4000, userSpecifiedPath);
					} 
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
								let fileHashValue = crypto.createHash('md5').update(sourceCode).digest("hex");

								if (sourceCode != null) {
									analyzeSourceFile(sourceCode, path.join(userSpecifiedPath, file));
									setTimeout(storeDetectionInDB, 4000, file, fileHashValue);
									
									console.log('complete scan normally finished!');
								}
							}
						});
					} else vscode.window.showErrorMessage("Error while reading files!");
					setTimeout(generateReport, 4000, undefined);
					console.log('complete scan normally finished!');
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
	
	store.load(fileHashValue, function(error, object) {
		if(error){
			console.log(error);
			console.log("Could not find json store data for that file!");
			
			const script = spawn('python3.8', [__dirname + '/py/main.py', sourceCode]);
			script.stdout.on('data', data => data ? startSmellInvestigation(data.toString(), fileName): console.log('No data from script!'));
			script.on('close', (exitCode) => exitCode ? console.log(`main script exit code ${exitCode}`) : 'main script exit code not found');
			script.on('error', (err) => console.log(err));
		}
		else {
			fs.appendFileSync(__dirname+"/warning-logs/project_warnings.csv", object.warnings);
			showWarningsNotifications(object.warnings);
		}
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
	fs.writeFileSync(path.join(__dirname, '/warning-logs/project_warnings.csv'), "");
}

const startSmellInvestigation = (tokens, fileName) => {
	let splittedTokens = tokens.split('\n');
	// console.log({'splitted tokens': splittedTokens});
	splittedTokens.pop(); //removing a blank item from array
	
	let importedPackages = getImportedPackagesInSourceCode(splittedTokens);
	detection.detect(fileName, splittedTokens, importedPackages);
}

const storeDetectionInDB = (fileName , hash) => {
	let warningObject = "";
	let data = fs.readFileSync(__dirname+'/warning-logs/project_warnings.csv');
	
	let porjectWarnings = data.toString().split("\n");
	porjectWarnings.pop(); //null array item removal due to new line split
	
	porjectWarnings.forEach(warning => {
		if(warning.search(fileName) != -1){
			warningObject = warningObject+warning+"\n";
		}
	});

	let smellLog = {id: hash, name: fileName, warnings: warningObject};
	store.add(smellLog, (err) => err? console.log(err): "successfully added to store");
}

const generateReport = (fileName) => {

	try {
		let data = fs.readFileSync(__dirname+'/warning-logs/project_warnings.csv');
		let porjectWarnings = data.toString().split("\n");
		porjectWarnings.pop(); //null array item removal due to new line split
		
		console.log({'projectkwarnings ': porjectWarnings});
		createPDFDocument.createPDFDocument("QuickScanResult.pdf", porjectWarnings, __dirname, fileName);
		// createJsonDocument.createJsonDocument("QuickScanResult.txt", porjectWarnings, __dirname, fileName);
		
		console.log('generate report function executed');
	}
	catch (e) {
		console.log("Error here in generate report");
		console.log(e);
	}
}  


exports.activate = activate;

function deactivate() {
	// this method is called when your extension is deactivated
	//Extension should clean up the resources that it has consumed during operation.
}

module.exports = { activate, deactivate}
