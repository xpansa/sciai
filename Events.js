/*
*
* Events file includes all functions that can be called from client side.
*
*/

/*
* Insert document structure for selected type
*/
function insertDocumentStructure(type) {
  var doc = DocumentApp.getActiveDocument();
  // check if document is empty
  if (isDocumentEmpty()) {
    // if empty - insert document structure
    var cursor = doc.getCursor();
    if (cursor) {
      generateStructure(type, cursor);
    } else {
      DocumentApp.getUi().alert('Cannot find a cursor.');
    }
  } else {
    // if not empty - ask user what he wants to do
    var docUi = DocumentApp.getUi();
    var response = docUi.alert('Warning','Do you want to replace your content (Yes button)' 
                               + ' or insert in place of cursor (No button)?', docUi.ButtonSet.YES_NO);
    if (response == docUi.Button.YES) {
      // replace all content
      removeAllContent();
    }
    // if insert in place of cursor
    var cursor = doc.getCursor();
    if (cursor) {
      generateStructure(type, cursor);
    } else {
      DocumentApp.getUi().alert('Cannot find a cursor.');
    }
  } // if document is not empty
}

/*
* Remove all content from the current document
*/
function removeAllContent() {
  var doc = DocumentApp.getActiveDocument();
  doc.setText(''); 
}

/*
* UNUSED FUNCTION
* @param {string} text Element (text) to wrap (optional)
* @param {string} type Type of element to wrap
* @param {string} id ID of element (optional)
*/
function formSection(type, text, id) {
  if(!text) {
    text = getSelectedText();
  }
  else if((typeof text) == 'string' ) {
    text = [text];
  }
  
  var processedText = wrapElements(type, text, id); 
  insertText(processedText);
}

/*
* UNUSED FUNCTION
*/
function wrapElements(type, text, id) {
  var processed = [];
  if (id) {
    for (var i = 0; i < text.length; i++) {
      processed.push('<' + type + ' id="' +id + '">' + text[i]+ '</' + type + '>');
    }
  }
  else {
    for (var i = 0; i < text.length; i++) {
      processed.push('<' + type + '>' + text[i]+ '</' + type + '>');
    }
  }
  return processed.join('\n');
}


/*
* Prototype of function that will make search
* TODO: rewrite this function
* @param {string} term Text to use as term for search (optional)
*/
function searchTerm(elementType) {
  var term = getSelectedText();
  
  var searchResult = [];
  if(elementType == 'uniprot') {
    searchResult = searchUniprot(term);
  } else if (elementType == 'orcid') {
    //TODO: replace searchPerson to ORCID specific function
    searchResult = searchPerson(term);
  } else if (elementType == 'pubmed') {
    searchResult = testingNcbi(term, 'pubmed');
  } else if (elementType == 'ncbi-gene') {
    searchResult = testingNcbi(term, 'ncbi-gene');
  } else if (elementType == 'ncbi-protein') {
    searchResult = testingNcbi(term, 'ncbi-protein');
  } else if (elementType == 'ncbi-genome') {
    searchResult = testingNcbi(term, 'ncbi-genome');
  } else if (elementType == 'ncbi-taxonomy') {
    searchResult = testingNcbi(term, 'ncbi-taxonomy');
  }
  return searchResult;
}