import ast
import sys
from parse import Analyzer

def main():
    srcCode = sys.argv[1]
    # print(srcCode)
    tree = ast.parse(srcCode, type_comments=True)
    # print(ast.dump(tree))

    analyzer = Analyzer()
    analyzer.visit(tree)
    analyzer.findUserInputInFunction()
    analyzer.report()
    exit(0)
    # sys.stdout.flush()
    # print(ast.dump(tree,include_attributes=True))


if __name__ == "__main__":
    main()
