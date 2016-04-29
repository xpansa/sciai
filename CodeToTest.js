

function getAllTags() {
  var documentProperties = PropertiesService.getDocumentProperties();
  var data = documentProperties.getProperties();
  var results = [];
  for (var key in data) {
    Logger.log('Key: %s, Value: %s', key, data[key]);
    var obj = JSON.parse(data[key]);
    obj.text = getNamedRangeText(obj.namedRangeId);
    results.push(obj);
  }
  return results;
}


function getNamedRangeText(id) {
  var namedRange = getNamedRangeById(id);
  var elements = namedRange.getRange().getRangeElements();
  
  var content = "";
  
  for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      
      // Only modify elements that can be edited as text; skip images and other non-text elements.
      if (element.getElement().editAsText) {
        
        // Adding selection to necessary range
        var text = element.getElement().asText().getText();
                
        if (element.isPartial()) {
           var startOffset = elements[0].getStartOffset();
          var endOffset = elements[0].getEndOffsetInclusive();
          text = text.substring(startOffset,endOffset+1);
        }
        // just in case of trailing spaces
        // text = selectedText.trim();
        content += text;
      }
   }  
  return content;  
}

/*
** Create a new tag: create a NamedRange element and write a new DocumentProperty
*/
function createNewTag(type, id) {
  // check if search result or custom tag
  // if no id specified - custom tag
  var typeToHighlight = 'custom';
  if (id) {
    typeToHighlight = 'term'; 
  }
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    // create a new NamedRange
    var namedRangeId = createRange(type, selection);
    // highlight NamedRange
    highlightNamedRange(namedRangeId, typeToHighlight);
    // create a new DocumentProperty
    var propertyContent = formPropertyContent(namedRangeId, type, id);
    // set a new property
    setNewProperty(namedRangeId, propertyContent);
  } else {
    DocumentApp.getUi().alert('Nothing is selected.');
  }
}



function highlightNamedRange(id, type) {
  Logger.log(type);
  var namedRange = getNamedRangeById(id);
  if (!namedRange) {
    Logger.log('NamedRange not found');
    return;
  }
  
  var elements = namedRange.getRange().getRangeElements();
  
  for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      
      // Only modify elements that can be edited as text; skip images and other non-text elements.
      if (element.getElement().editAsText) {
        
        // Adding selection to necessary range
        var text = element.getElement().editAsText();
                
        if (element.getElement().editAsText) {
          var text = element.getElement().editAsText();
          
          if (element.isPartial()) {
            text.setAttributes(element.getStartOffset(), element.getEndOffsetInclusive(), getStyles(type));
          } else {
            text.setAttributes(getStyles(type));
          }
        }
      }
   }  
}


/* 
** Test function, can be used as example
*/
function unusedInsertTags() {
  // do insert tags instead of NamedRanges
  var documentProperties = PropertiesService.getDocumentProperties();
  var data = documentProperties.getProperties();
  for (var key in data) {
    Logger.log('Key: %s, Value: %s', key, data[key]);
    var propertyValue = JSON.parse(data[key]);
    Logger.log(typeof propertyValue);
    var namedRange = getNamedRangeById(key);
    // if not found - skip iteration
    if(!namedRange)
      continue;
    var elements = namedRange.getRange().getRangeElements();
    
    // search for first and last text elements
    var i = 0;
    firstElement = elements[0];
    lastElement = elements[elements.length - 1];
    while(!firstElement.getElement().editAsText && i < elements.length) {
      i++;
      firstElement = elements[i];
    }
    i = elements.length - 1;
    while(!lastElement.getElement().editAsText && i >= 0) {
      i--;
      lastElement = elements[i];
    }
    
    // insert tags
    var text = lastElement.getElement().editAsText();
    if (lastElement.isPartial()) {
      var str = text.getText().substr(lastElement.getStartOffset(), lastElement.getEndOffsetInclusive() - lastElement.getStartOffset() + 1);
      text.insertText(lastElement.getEndOffsetInclusive() + 1, '</' + propertyValue.type + '>');
    } else {
      text.appendText('</' + propertyValue.type + '>');
    }
    
    var text = firstElement.getElement().editAsText();
    if (firstElement.isPartial()) {
      var str = text.getText().substr(firstElement.getStartOffset(), firstElement.getEndOffsetInclusive() - firstElement.getStartOffset() + 1);
      text.insertText(firstElement.getStartOffset(), '<' + propertyValue.type + ' id=' + propertyValue.dataId + '>');
    } else {
      text.insertText(0, '<' + propertyValue.type + ' id=' + propertyValue.dataId + '>');
    }    
  }
}



/* 
** Get NamedRange by the ID 
*/
function getNamedRangeById(rangeId) { 
  var doc = DocumentApp.getActiveDocument();
  var named = doc.getNamedRangeById(rangeId);
  if (named) {
    Logger.log('Found named range');
    return named;  
  } else {
    Logger.log("Named range with id = " + rangeId + " not found!");
    return false;
  }
}

/*
** Delete all DocumentProperties
*/
function removeAllProperties() {
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteAllProperties();
}

/*
** Remove property by the name
*/
function removeTag(name) {
  var content = JSON.parse(getPropertyValue(name));
  highlightNamedRange(content.namedRangeId, 'none');
  removeNamedRange(content.namedRangeId);
  removeProperty(name);
}

function removeNamedRange(id) {
  var namedRange = getNamedRangeById(id);
  namedRange.remove();
}


/*
** Form property content
*/
function formPropertyContent(namedRangeId, type, dataId) {
  var content = {namedRangeId: namedRangeId, type: type, dataId: dataId};
  return content;
}



/* 
** Create a new NamedRange
** @param {string} name The name for a new NamedRange 
** @param {Range} elements The elements to be added into a new NamedRange
*/
function createRange(name, elements) {
  Logger.log('Creating a new range with the name ' + name);
  var doc = DocumentApp.getActiveDocument();
  var rangeBuilder = doc.newRange();
  rangeBuilder.addRange(elements);
  return doc.addNamedRange(name, rangeBuilder.build()).getId(); 
}




/*
** Print all properties to console (useful for testing)
*/
function printAllPropertiesToConsole() {
  var documentProperties = PropertiesService.getDocumentProperties();
  var data = documentProperties.getProperties();
  for (var key in data) {
    Logger.log('Key: %s, Value: %s', key, data[key]);
  }
}

/*
** Print all properties to console (useful for testing)
*/
function printAllNamedRangesToConsole() {
  var doc = DocumentApp.getActiveDocument();
  var namedRanges = doc.getNamedRanges();
  for (var key in namedRanges) {
    Logger.log('Key: %s, Value: %s', key, namedRanges[key].getId());
  }
}



/*
** Remove all NamedRange
*/
function removeAllNamedRanges() {
  var doc = DocumentApp.getActiveDocument();
  var nr = doc.getNamedRanges();
  for(var j = 0; j < nr.length; j++) {
    nr[j].remove();
  }
}



/*
** Get all NamedRanges
*/
function getAllNamedRanges() {
  var doc = DocumentApp.getActiveDocument();
  var nr = doc.getNamedRanges();
  for(var j = 0; j < nr.length; j++) {
    Logger.log(nr[j].getId());
  }
}

/*
** Get property by key
*/
function getPropertyValue(key) {
  var documentProperties = PropertiesService.getDocumentProperties();
  var data = documentProperties.getProperty(key);
  return data;
}

/*
** Set property value by key
*/
function setNewProperty(key, value) {
  value = JSON.stringify(value);
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty(key, value);
}

/*
** Remove property by key
*/
function removeProperty(key) {
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteProperty(key);
}