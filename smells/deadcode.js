var log = {
  info: function (info) { 
      console.log('Info: ' + info);
  },
  warning:function (warning) { 
      console.log('Warning: ' + warning);
  },
  error:function (error) { 
      console.log('Error: ' + error);
  }
};

module.exports = log

// const filbert = require('filbert');
//const filbert_loose = require('filbert/filbert_loose');


// function createAST(pcode)
// {
// 	//var ast = "";
// 	//const ast = filbert.parse(pcode, { locations: true, ranges: true });
// 	//ast = filbert.parse(pcode);
// 	//var ast_damn = filbert_loose.parse_dammit(pcode);
// 	//if(ast != null)traverseAST(ast);
// }


// function traverseAST(obj)
// {
// 	const window = vscode.window;
// 	const limit = obj.body.length;

// 	for(let i=0;i<limit;i++)
// 	{
// 		let node = obj.body[i];
// 		window.showInformationMessage(node);

// 		if(node.type === "VariableDeclaration")
// 		{
// 			console.log(node.declarations.id.name);
// 			window.showInformationMessage(node.declarations.id.name);
// 			if(node.init.type === "Literal")
// 			{
// 				window.showInformationMessage(node.declarations.init.value);
// 				console.log(node.init.value);
// 			}
// 		}
		
// 		//if(typeof value === 'object') traverseAST(value);
// 		//else if(Array.isArray(value)) traverseAST(value);
// 	}
// }
