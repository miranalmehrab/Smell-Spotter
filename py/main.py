import ast
import sys
import json

from analyzer import Analyzer

def parse_code(code):
    try:
        tree = ast.parse(code, type_comments=True)
        # print(ast.dump(tree,include_attributes=True))
        # print(ast.dump(tree))

        analyzer = Analyzer()
        analyzer.visit(tree)
        analyzer.refine_tokens()        
        analyzer.print_statements()
        
    except Exception as error:
        print(str(error)) 


def main():
    code = sys.argv[1]
    parse_code(code)
    
    
if __name__ == "__main__":
    main()
