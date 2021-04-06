import ast
import sys
import json

from engine import RuleEngine
from analyzer import Analyzer

def parse_code(code, src_file_name):
    try:
        tree = ast.parse(code, type_comments=True)
        # print(ast.dump(tree,include_attributes=True))
        # print(ast.dump(tree))

        analyzer = Analyzer()
        analyzer.visit(tree)
        analyzer.refine_tokens()        
        # analyzer.print_statements()

        tokens = analyzer.return_statements()
        
        engine = RuleEngine(tokens, src_file_name)
        engine.filter() 
        
    except Exception as error:
        print(str(error)) 


def main():
    code = sys.argv[1]
    src_file_name = sys.argv[2]
    
    parse_code(code, src_file_name)
    
    
if __name__ == "__main__":
    main()
