const vscode = require('vscode');

const defaultSorter = require('./default-sorter');

/**
 * Returns an array of actions to format the document.
 *
 * @param {any} document
 * @returns
 */
function format(document) {
  const range = findImports(document);
  if (!range) {
    return null;
  }

  const imports = extractImports(document, range);
  const code = sortImports(imports);

  return [
    createReplaceAction(range, `${code}\n`)
  ];
}


/**
 * Generate code for the resorted imports.
 *
 * @param {any} imports
 */
function sortImports(imports) {
  return defaultSorter.sort(imports);
}


/**
 * Return a new TextEdit action which will replace the range with the given code.
 *
 * @param {any} range
 * @param {any} code
 * @returns
 */
function createReplaceAction(range, code) {
  return vscode.TextEdit.replace(range, code);
}

/**
 * Returns an array which contains all the import code lines.
 *
 * @param {any} document
 * @param {any} range
 */
function extractImports(document, range) {
  const codes = document.getText(range).trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return codes.split('\n').filter(
    (line) => {
      const code = line.trim();
      return isImportStatement(code);
    });
}

/**
 * Returns a vscode.Range object which represents the range contains all the leading imports.
 * Returns null if no import was found.
 *
 * @param {any} document
 * @returns
 */
function findImports(document) {
  const firstLine = findFirstImportLine(document);
  if (!firstLine) {
    return null;
  }
  const lastLine = findLastImportLine(document, firstLine);
  return new vscode.Range(
    firstLine.range.start,
    lastLine.range.end
  );
}

/**
 * Find the first import statement in the document.
 *
 * @param {any} document
 * @returns
 */
function findFirstImportLine(document) {
  let lineNumber = 0;
  let line = document.lineAt(lineNumber);
  while (!isImportStatement(line)) {
    lineNumber++;
    if (lineNumber === document.lineCount - 1) {
      return null;
    } else {
      line = document.lineAt(lineNumber);
    }
  };
  return line;
}

/**
 * Find the last import line in the document.
 *
 * @param {any} document
 * @param {any} startLine
 * @returns
 */
function findLastImportLine(document, startLine) {
  let lineNumber = startLine.lineNumber;
  let line = document.lineAt(lineNumber);
  while (
    isImportStatement(line) ||
    isEmpty(line)
  ) {
    lineNumber++;
    if (lineNumber === document.lineCount - 1) {
      return line;
    }
    line = document.lineAt(lineNumber);
  };
  return document.lineAt(lineNumber - 1);
}



/**
 * Returns whether the line is an import statement.
 *
 * @param {any} line
 * @returns {boolean}
 */
function isImportStatement(line) {
  const code = (typeof(line) === 'string' ? line : line.text).trim();
  if (code.startsWith('import ')) {
    return true;
  }
  return false;
}

/**
 * Returns whether the line is empty.
 *
 * @param {any} line
 * @returns
 */
function isEmpty(line) {
  const code = (typeof(line) === 'string' ? line : line.text).trim();
  if (code === '') {
    return true;
  }
  return false;
}

exports.format = format;