import ast
import sys
from parse import Analyzer
from detection.detection import detection

def main():
    srcCode = sys.argv[1]
    # print(srcCode)
    tree = ast.parse(srcCode, type_comments=True)
    # print(ast.dump(tree))

    analyzer = Analyzer()
    analyzer.visit(tree)
    analyzer.findUserInputInFunction()
    analyzer.report()

    # f = open("tokens.txt", "r")
    # detection(f.read())
    # print(ast.dump(tree,include_attributes=True))


if __name__ == "__main__":
    main()
