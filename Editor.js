/*
*
* Editor file includes all function to work with document content
*
*/

/*
* Gets the text the user has selected. If there is no selection,
* this function displays an error message.
* TODO: review this function, remove false returns
* @return {Array.<string>} The selected text.
*/
function getSelectedText() {
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    var text = [];
    var elements = selection.getSelectedElements();
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].isPartial()) {
        var element = elements[i].getElement().asText();
        var startIndex = elements[i].getStartOffset();
        var endIndex = elements[i].getEndOffsetInclusive();
        text.push(element.getText().substring(startIndex, endIndex + 1));
      } else {
        var element = elements[i].getElement();
        // Only elements that can be edited as text; skip images and
        // other non-text elements.
        if (element.editAsText) {
          var elementText = element.asText().getText();
          // This check is necessary to exclude images, which return a blank
          // text element.
          if (elementText != '') {
            text.push(elementText);
          }
        }
      }
    }
    if (text.length == 0) {
      return false;
    }
    return text;
  } else {
    return false;
  }
}

/*
* Check if current document is empty
*/
function isDocumentEmpty() {
  var doc = DocumentApp.getActiveDocument();
  var content = doc.getBody().getText();
  if (!content) {
    return true;
  } else {
    return false;
  }
}

/* 
* Generate document structure for selected type
* @param {string} type Type of document. For example, article
*/
function generateStructure(type, cursor) {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var structureElements = getStructure(type);
  var element = cursor.getElement();
  if(element.getType() == DocumentApp.ElementType.TEXT) {
    element = element.getParent();
  }
  if (element) {
    for(var i = 0; i < structureElements.length; i++) {
      var section = structureElements[i];
      // open section tag
      var elementIndex = body.getChildIndex(element);
      Logger.log(elementIndex);
      var element = body.insertParagraph(0, "← Start of the " + section + " →");
      element.removeFromParent();
      element = body.insertParagraph(elementIndex+1, element).setAttributes(getStyles('section'));
      // empty line for section content
      elementIndex = body.getChildIndex(element);
      Logger.log(elementIndex);
      element = body.insertParagraph(0, "\n\n\n");
      element.removeFromParent();
      element = body.insertParagraph(elementIndex+1, element);
      //close section tag
      elementIndex = body.getChildIndex(element);
      Logger.log(elementIndex);
      element = body.insertParagraph(0, "← End of the " + section + " →");
      element.removeFromParent();
      element = body.insertParagraph(elementIndex+1, element).setAttributes(getStyles('section'));
      // empty line between sections
      elementIndex = body.getChildIndex(element);
      Logger.log(elementIndex);
      element = body.insertParagraph(0, "");
      element.removeFromParent();
      element = body.insertParagraph(elementIndex+1, element);
    }
  } else {
    DocumentApp.getUi().alert('Cannot insert text here.');
  }
}

/*
* Replaces the text of the current selection with the provided text, or
* inserts text at the current cursor location. (There will always be either
* a selection or a cursor.) If multiple elements are selected, only inserts the
* text in the first element that can contain text and removes the
* other elements.
*
* @param {string} newText The text with which to replace the current selection.
*/
function insertText(newText) {
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    var replaced = false;
    var elements = selection.getSelectedElements();
    if (elements.length == 1 &&
        elements[0].getElement().getType() == DocumentApp.ElementType.INLINE_IMAGE) {
      throw "Can't insert text into an image.";
    }
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].isPartial()) {
        var element = elements[i].getElement().asText();
        var startIndex = elements[i].getStartOffset();
        var endIndex = elements[i].getEndOffsetInclusive();
        
        var remainingText = element.getText().substring(endIndex + 1);
        element.deleteText(startIndex, endIndex);
        if (!replaced) {
          element.insertText(startIndex, newText);
          replaced = true;
        } else {
          // This block handles a selection that ends with a partial element. We
          // want to copy this partial text to the previous element so we don't
          // have a line-break before the last partial.
          var parent = element.getParent();
          parent.getPreviousSibling().asText().appendText(remainingText);
          // We cannot remove the last paragraph of a doc. If this is the case,
          // just remove the text within the last paragraph instead.
          if (parent.getNextSibling()) {
            parent.removeFromParent();
          } else {
            element.removeFromParent();
          }
        }
      } else {
        var element = elements[i].getElement();
        if (!replaced && element.editAsText) {
          // Only translate elements that can be edited as text, 
          // removing other elements.
          element.clear();
          element.asText().setText(newText);
          replaced = true;
        } else {
          // We cannot remove the last paragraph of a doc. If this is the case,
          // just clear the element.
          if (element.getNextSibling()) {
            element.removeFromParent();
          } else {
            element.clear();
          }
        }
      }
    }
  } else {
    var cursor = DocumentApp.getActiveDocument().getCursor();
    var surroundingText = cursor.getSurroundingText().getText();
    var surroundingTextOffset = cursor.getSurroundingTextOffset();
    
    // If the cursor follows or preceds a non-space character, insert a space
    // between the character and the translation. Otherwise, just insert the
    // translation.
    if (surroundingTextOffset > 0) {
      if (surroundingText.charAt(surroundingTextOffset - 1) != ' ') {
        newText = ' ' + newText;
      }
    }
    if (surroundingTextOffset < surroundingText.length) {
      if (surroundingText.charAt(surroundingTextOffset) != ' ') {
        newText += ' ';
      }
    }
    cursor.insertText(newText);
  }
}
