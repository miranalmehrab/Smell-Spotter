import ast
import sys
from parse import Analyzer

def main():
    srcCode = sys.argv[1]
    tree = ast.parse(srcCode, type_comments=True)
    print(ast.dump(tree))

    analyzer = Analyzer()
    analyzer.visit(tree)
    analyzer.findUserInputInFunction()
    analyzer.report()
    
    
if __name__ == "__main__":
    main()
