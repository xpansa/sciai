/* 
* Check if range with such name already exists 
* @rangeName - name of the NamedRange to search
*/
function checkIfRangeExists(rangeName) {
  var doc = DocumentApp.getActiveDocument();
  var namedRanges = doc.getNamedRanges(rangeName);
  if(namedRanges.length > 0) {
    return true;
  } else {
    return false;
  }
}

/*
* Merge two NamedRanges
*/
function appendRange(rangeName, rangeToAppend) {
  Logger.log('Append a new range into range with the name ' + rangeName);
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var rangeBuilder = doc.newRange();
  
  var originalRangeId = getNamedRangeByName(rangeName);
  var originalRange = getNamedRangeById(originalRangeId);
  
  if (originalRangeId) {
    rangeBuilder.addRange(originalRange.getRange());
    rangeBuilder.addRange(rangeToAppend);
  }
  
  // remove original old range
  Logger.log("Remove original range...");
  removeRanges([originalRange]);
  
  return doc.addNamedRange(rangeName, rangeBuilder.build()); 
}

/* Add a new element into current NamedRange with replacing it 
* rangeName - name of the NamedRange to replace
* element - element ot add into range 
*/
function addElementIntoNamedRange(rangeName, element) {
  Logger.log('Adding a new element into range with the name ' + rangeName);
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var rangeBuilder = doc.newRange();
  
  var namedRangeId = getNamedRangeByName(rangeName);
  if (namedRangeId) {
    Logger.log("Old ID = " + namedRangeId);
    
    // ! TODO: replace with addRange() function
    var elements = getRangeElementsFromNamedRange(namedRangeId);
    Logger.log("Getting elements from old range...");
    
    // remove old namedRange
    Logger.log("Removing old range...");
    removeRanges([getNamedRangeById(namedRangeId)]);
    
    // create a new one
    
    for (el in elements) {
      rangeBuilder.addElement(elements[el].getElement());
    }
  }

  var element = body.appendParagraph('HELLO'); 
  //var selection = DocumentApp.getActiveDocument().getSelection();
  rangeBuilder.addElement(element);
  return doc.addNamedRange(rangeName, rangeBuilder.build()); 
}

/* Get elements from NamedRange
* rangeId - range ID
*/
function getRangeElementsFromNamedRange(rangeId) {
  var namedRange = getNamedRangeById(rangeId);
  if(namedRange) {
    var range = namedRange.getRange();
    var elements = range.getRangeElements();
    return elements;
  }
  return false;
}

/*
* UNUSED FUNCTION
*/
function runTesting(type) {
  Logger.log('Running testing for term = ' + type);
  var namedRangeId = getNamedRangeByName(type);
  var namedRange = getNamedRangeById(namedRangeId);
  var elements = getRangeElementsFromNamedRange(namedRangeId);
  var str = [];
  for (el in elements) {
    ele = elements[el];
    if (ele.isPartial()) {
      str.push(ele.getElement().getText().slice(ele.getStartOffset(),ele.getEndOffsetInclusive()+1));
    } else {
      str.push(ele.getElement().getText());
    }
  }
  return str;
}

/* Testing */
function addTextWithNamedRange(str, name) {
  // Add a new paragraph to end of doc
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var text = body.appendParagraph(str); 
  
  // Creates a NamedRange that includes the new paragraph
  // Return the created Named Range
  var rangeBuilder = doc.newRange();
  rangeBuilder.addElement(text);
  return doc.addNamedRange(name, rangeBuilder.build()); 
}

/* Remove ranges from the current doc */
/* TODO: remove by id, single or multiple objects */
function removeRanges(ranges) {
  Logger.log("Remove " + ranges.length + " ranges");
  Logger.log(typeof(ranges));
  Logger.log(ranges);
  for(r in ranges) {
    //Logger.log(ranges[r].getId());
    ranges[r].remove();
  }
  Logger.log('Check if we remove all namedRanges');
  var doc = DocumentApp.getActiveDocument();
  var namedRanges = doc.getNamedRanges('gene');
  Logger.log(namedRanges);
}

/* 
** Get NamedRange by the name (name not necessary unique) 
*/
function getNamedRangeByName(rangeName) { 
  Logger.log("Search for named range with the name = " + rangeName);
  var doc = DocumentApp.getActiveDocument();
  var namedRanges = doc.getNamedRanges(rangeName);
  Logger.log(namedRanges);
  if(namedRanges.length > 1) {
    removeRanges(namedRanges);
    Logger.log("Something gones wrong. Length of array with namedRanges > 1");
    return false;
  } else {
    var namedRangeId = namedRanges[0].getId();
    return namedRangeId;
  }
}

/*
* Highlight selected elements
* NOT USED IN CURRENT VERSION
* SHOULD BE MOVED TO SEPARATE FILE?
* @param {string} type Type of element. 
*     This parameter should be used when creating a new NamedRange.
*
*/
function highlightText(type) {
  Logger.log("Highlight text with type = " + type);
  var selection = DocumentApp.getActiveDocument().getSelection();
  // do anything only if user select some text
  if (selection) {
    var doc = DocumentApp.getActiveDocument();
    
    // array with the elements from selected content
    var elements = selection.getRangeElements();
    
    Logger.log("Number of elements: " + elements.length);
    
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      
      // Only modify elements that can be edited as text; skip images and other non-text elements.
      if (element.getElement().editAsText) {
        
        // Adding selection to necessary range
        var text = element.getElement().editAsText();
        
        if (checkIfRangeExists(type)) {
          // if necessary range exists then just append a new range
          Logger.log("Existing range");
          appendRange(type, selection);
        } else {
          // else create a new range
          Logger.log("Creating a new range");
          createRange(type, selection);
        }
        
        Logger.log('We should highlight selected text');
        
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
}

function getTags() {
  var tags = [];
  var body = DocumentApp.openById('1uWZHqsvIki27Akfg8fH-HNTnmbfoZZ-xiYTtfZC-UxY').getBody();
  
  var nextRangeElement = body.findText('<[^>]*>');
  
  
  while(nextRangeElement) {
    tags.push(nextRangeElement);
    nextRangeElement = body.findText('<[^>]*>', nextRangeElement);
  }
  return tags;
}


function test1() {
  var tags = getTags();
  if(tags.length % 2) {
    Logger.log('Not even number of tags');
    return false;
  }
  var opened = [];
  var openedTags = [];
  for(var i = 0; i < tags.length - 1; i++) {
    Logger.log(opened);
    var previousTag = (i > 0) ? getTextFromRangeElement(tags[i-1]) : '';
    var currentTag = getTextFromRangeElement(tags[i]);
    var nextTag = getTextFromRangeElement(tags[i+1]);
    Logger.log('Current ' + currentTag);
    Logger.log('Next ' + nextTag);
    if(compareTags(currentTag, nextTag) && !isClosingTag(currentTag) && isClosingTag(nextTag)) {
      Logger.log('Tags equal');
      continue;
    } 
    else {
      // if current tag is closing
      if(isClosingTag(currentTag)) {
        Logger.log('Current tag is closing tag');
        if(compareTags(currentTag, previousTag)) {
          Logger.log('Prev and Current elements equal. Ok.');
        }
        else {
          var index = opened.lastIndexOf(getClearTag(currentTag));
          if(index > -1) {
            opened.splice(index, 1);
            openedTags.splice(index, 1);
            Logger.log('Found result in opened array');
            continue;
          } else {
            Logger.log('Not found results in opened array. Error!');
            tags[i].getElement().setAttributes(getStyles('term'));
            break;
          }
        }
      } 
      // if current tag is not closing
      else {
        Logger.log('Current tag is not closing tag');
        openedTags.push(tags[i]);
        opened.push(getClearTag(currentTag));
      }
    }
    
  }
  if(openedTags.length > 0) {
    Logger.log('Un-closed opening tags');
    Logger.log(openedTags);
    for(var i = 0; i < openedTags.length; i++) {
      openedTags[i].getElement().setAttributes(getStyles('gene'));
    }
  } else {
    Logger.log('It is fully okay');
  }
}


function testSyntax() {
  var body = DocumentApp.openById('1uWZHqsvIki27Akfg8fH-HNTnmbfoZZ-xiYTtfZC-UxY').getBody();
  
  var currentRangeElement = body.findText('<[^>]*>');
  var nextRangeElement = body.findText('<[^>]*>', currentRangeElement);
  
  var counter = 2;
  
  var tags = [];
  
  while(nextRangeElement) {
    Logger.log('----------------------------------');
    Logger.log('Next ' + getTextFromRangeElement(nextRangeElement));
    Logger.log('Current ' + getTextFromRangeElement(currentRangeElement));
    
    // compare two tags
    if(!(counter % 2)) {
      Logger.log('Comparing...');
      var currentTag = getTextFromRangeElement(currentRangeElement);
      var nextTag = getTextFromRangeElement(nextRangeElement);
      // if not equal - error
      if(!compareTags(currentTag, nextTag)) {
        if(!isClosingTag(nextTag)) {
          tags.push(nextRangeElement);
        } else {
          Logger.log('Tags not equal: ' + currentTag + ' - ' + nextTag);
          nextRangeElement.getElement().setAttributes(getStyles('gene'));
        }
      }
      else {
        Logger.log('It is okay');
      }
    }
    
    counter++;
    
    currentRangeElement = nextRangeElement;
    nextRangeElement = body.findText('<[^>]*>', currentRangeElement);
  }
  
  // if tags number is not even - error
  if (!(counter % 2)) {
    Logger.log('Non-expected tag!');
    currentRangeElement.getElement().setAttributes(getStyles('gene'));
  }
  
}

function getClearTag(tag) {
  var rx = /<\/*(\w+)\s*\w*.*?>/;
  var tagName = rx.exec(tag);
  return tagName[1];
}

function compareTags(tag1, tag2) {
  var rx = /<\/*(\w+)\s*\w*.*?>/;
  var tagName1 = rx.exec(tag1);
  var tagName2 = rx.exec(tag2); 
  Logger.log('Compare: ' + tag1 + ' and ' + tag2);
  return (tagName1[1] == tagName2[1]);
}


function isClosingTag(tag) {
  var rx = /<\/+(\w+)\s*\w*.*?>/;
  return (tag.search(rx) != -1);
}




function getTextFromRangeElement(rangeElement) {
  var text = '';
  
  if (rangeElement.isPartial()) {
    var element = rangeElement.getElement().asText();
    var startIndex = rangeElement.getStartOffset();
    var endIndex = rangeElement.getEndOffsetInclusive();
    
    text = element.getText().substring(startIndex, endIndex + 1);
  } else {
    var element = rangeElement.getElement();
    // Only elements that can be edited as text; skip images and
    // other non-text elements.
    if (element.editAsText) {
      var elementText = element.asText().getText();
      // This check is necessary to exclude images, which return a blank
      // text element.
      if (elementText != '') {
        text = elementText;
      }
    }
  }
  return text.toString();
}



/* FROM HTML FILES */
function makeTerm() {
  this.disabled = true;
  $('#error').remove();
  //var type = $('#type-of-element').val();
  //console.log(type);
  //console.log($('#type-of-element'));
  google.script.run
  .withSuccessHandler(
    function(processedText, element) {
      $('#preview-element').val(processedText);
      element.disabled = false;
    })
  .withFailureHandler(
    function(msg, element) {
      showError(msg, $('#button-bar'));
      element.disabled = false;
    })
  .withUserObject(this)
  .runTesting('gene');
}

function insertText() {
  this.disabled = true;
  $('#error').remove();
  google.script.run
  .withSuccessHandler(
    function(returnSuccess, element) {
      $('#search-results').empty();
      $('#preview-text').val('');
      element.disabled = false;
    })
  .withFailureHandler(
    function(msg, element) {
      showError(msg, $('#button-bar'));
      element.disabled = false;
    })
  .withUserObject(this)
  .insertText($('#preview-text').val());
}

function wrapElement() {
  this.disabled = true;
  $('#error').remove();
  google.script.run
  .withSuccessHandler(
    function(returnSuccess, element) {
      $('#preview-element').val('');
      element.disabled = false;
    })
  .withFailureHandler(
    function(msg, element) {
      showError(msg, $('#button-bar'));
      element.disabled = false;
    })
  .withUserObject(this)
  .highlightText('gene');
}