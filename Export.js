/*
* Export to 'clear' format. Clear means that doc doesn't contain any colored elements
*/
function exportClear() {
  var doc = DocumentApp.getActiveDocument();
  var fileName = doc.getName() + '_clear';
  var file = makeClearCopy(doc, fileName);
  
  DocumentApp.getUi().alert('New clear file with the name ' 
                            + file.getName() 
                            + ' created in the article folder');
}

/*
* Remove all highlighted elements from the doc with specified ID 
*/
function removeHighlightingFromDoc(docId) {
  var doc = DocumentApp.openById(docId);
  var content = doc.getBody();
  var documentProperties = PropertiesService.getDocumentProperties();
  var data = documentProperties.getProperties();
  
  for (var key in data) {
    var propertyValue = JSON.parse(data[key]);
    var namedRange = doc.getNamedRangeById(key);
    // if not found - skip iteration
    if(!namedRange) {
      continue;
    }
    var elements = namedRange.getRange().getRangeElements();
    
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      
      // Only modify elements that can be edited as text; skip images and other non-text elements.
      if (element.getElement().editAsText) {
        // remove styles for a part of element in case if 
        // element is partial
        if (element.isPartial()) {
          text.setAttributes(element.getStartOffset(), element.getEndOffsetInclusive(), getStyles('none'));
        } else {
          text.setAttributes(getStyles('none'));
        }
      }
    }    
  }
  doc.saveAndClose();
}
/*
* Export to the SCI format (similar to XML)
*/
function exportSci() {
  var doc = DocumentApp.getActiveDocument();
  var docId = doc.getId();
  var docFile = DriveApp.getFileById(docId);
  var filename = doc.getName() + '_sci_tmp';
  var content = doc.getBody().getText();
  
  var articleFolder = getFileFolder(doc);
  // if file exists - remove old version
  if (isFileExists(filename, articleFolder)) {
    // logger.log('Remove ' + filename + ' from ' + articleFolder + ' folder');
    isFileExists(filename, articleFolder).setTrashed(true);
  }
  
  var copyFile = DriveApp.getFileById(docId).makeCopy();
  var copyId = copyFile.getId();
  
  replaceSectionsToTags(copyId);
  insertTags(copyId);
  
  copyFile.setName(filename);
  
  filename = doc.getName() + '_sci';
  content = DocumentApp.openById(copyId).getBody().getText();
  // if file exists - remove old version
  if (isFileExists(filename, articleFolder)) {
    // logger.log('Remove ' + filename + ' from ' + articleFolder + ' folder');
    isFileExists(filename, articleFolder).setTrashed(true);
  }
  
  var sciFile = DriveApp.createFile(filename, content);
  
  // add file to article folder and remove file from root folder
  var articleFolder = docFile.getParents().next();
  articleFolder.addFile(sciFile);
  DriveApp.getRootFolder().removeFile(sciFile);
  copyFile.setTrashed(true);
  
  DocumentApp.getUi().alert('New SCI file with the name ' 
                            + sciFile.getName() 
                            + ' created in the article folder');
}

/*
* Insert tags in document. Used when user exports 
* document to SCI format
*/
function insertTags(docId) {
  var doc = DocumentApp.openById(docId);
  var content = doc.getBody();
  var nr = doc.getNamedRanges();
  var documentProperties = PropertiesService.getDocumentProperties();
  var data = documentProperties.getProperties();
  
  for (var key in data) {
    var propertyValue = JSON.parse(data[key]);
    var namedRange = doc.getNamedRangeById(key);
    // if not found - skip iteration
    if(!namedRange) {
      continue;
    }
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
      var str = text.getText().substr(lastElement.getStartOffset(), 
                                      lastElement.getEndOffsetInclusive() - lastElement.getStartOffset() + 1);
      text.insertText(lastElement.getEndOffsetInclusive() + 1, 
                      '</' + propertyValue.type + '>');
    } else {
      text.appendText('</' + propertyValue.type + '>');
    }
    
    var text = firstElement.getElement().editAsText();
    // logger.log(typeof propertyValue.dataId);
    if (firstElement.isPartial()) {
      var str = text.getText().substr(firstElement.getStartOffset(), 
                                      firstElement.getEndOffsetInclusive() - firstElement.getStartOffset() + 1);
      text.insertText(firstElement.getStartOffset(), '<' + propertyValue.type 
                      + (propertyValue.dataId == undefined ? '' : (' id="' + propertyValue.dataId + '"'))
      + '>');
    } else {
      text.insertText(0, '<' + propertyValue.type 
                      + (propertyValue.dataId == undefined ? '' : (' id="' + propertyValue.dataId + '"'))
      + '>');
    }    
  }
  var text = doc.getBody().getText();
  newText = text.replace(/(\r\n|\n|\r)/gm, ' ');
  doc.getBody().clear().appendParagraph(newText);
  
  doc.saveAndClose();
}

/*
* Replace section blocks to special tags
*/
function replaceSectionsToTags(docId) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  
  var rangeElement = body.findText('← Start of the [^>]* →');
  while(rangeElement) {
    var element = rangeElement.getElement();
    var tag = element.getText().match('← Start of the ([^→]*) →')[1];
    element.editAsText().setText('<' + tag.toLowerCase() + '>');
    rangeElement = body.findText('← Start of the [^→]*→', rangeElement);
  }
  
  var rangeElement = body.findText('← End of the [^→]* →');
  while(rangeElement) {
    var element = rangeElement.getElement().getParent();
    var tag = element.getText().match('← End of the ([^→]*) →')[1];
    element.editAsText().setText('</' + tag.toLowerCase() + '>');
    rangeElement = body.findText('← End of the [^→]*→', rangeElement);
  }
  // save doc in the end of editing
  doc.saveAndClose();
}

/*
* Export document to PDF format
*/
function exportPdf() {
  // get current doc
  var doc = DocumentApp.getActiveDocument();
  var clearFileName = doc.getName() + '_clear';
  var fileName = doc.getName() + '_pdf';
  
  var articleFolder = getFileFolder(doc);
  if (isFileExists(fileName, articleFolder)) {
    // remove old verstion of file
    // logger.log('Remove ' + fileName + ' from ' + articleFolder + ' folder');
    isFileExists(fileName, articleFolder).setTrashed(true);
  }
  
  // update clear copy
  var clearFile = makeClearCopy(doc, clearFileName);
  
  // make a clear PDF copy
  var copyFile = DriveApp.createFile(clearFile.getAs('application/pdf'));
  var copyId = copyFile.getId();
  copyFile.setName(fileName);
  
  // add file to article folder and remove file from root folder
  var articleFolder = clearFile.getParents().next();
  articleFolder.addFile(copyFile);
  DriveApp.getRootFolder().removeFile(copyFile);
  
  DocumentApp.getUi().alert('New PDF file with the name ' 
                            + clearFile.getName() 
                            + ' created in the article folder');
}

/*
* Get current file folder
*/
function getFileFolder(file) {
  var folder = DriveApp.getFileById(file.getId()).getParents().next();
  return folder;
}

/*
* Make copy without highlighted elements
*/
function makeClearCopy(doc, fileName) {
  var articleFolder = getFileFolder(doc);
  if (isFileExists(fileName, articleFolder)) {
    // remove old verstion of file
    // logger.log('Remove ' + fileName + ' from ' + articleFolder + ' folder');
    isFileExists(fileName, articleFolder).setTrashed(true);
  }
  
  var docId = doc.getId();
  var copyFile = DriveApp.getFileById(docId).makeCopy();
  var copyId = copyFile.getId();
  
  // remove highlighted elements
  removeHighlightingFromDoc(copyId);
  // remove sections
  removeSectionTagsFromDoc(copyId);
  return copyFile.setName(fileName);
}

/*
* Check if file with the name exists in folder
*/
function isFileExists(file, folder) {
  if (!folder) {
    folder = DriveApp.getRootFolder();
  }
  var files = folder.getFilesByName(file);
  if (files.hasNext()) {
    return files.next();
  }
  else {
    return false;
  }
}

/*
* Export to DOCX format
*/
function exportDocx() {
  Logger.log('export');
  var doc = DocumentApp.getActiveDocument();
  var clearFileName = doc.getName() + '_clear';
  var fileName = doc.getName() + '_docx';
  
  var articleFolder = getFileFolder(doc);
  if (isFileExists(fileName, articleFolder)) {
    // remove old verstion of file
    // logger.log('Remove ' + fileName + ' from ' + articleFolder + ' folder');
    isFileExists(fileName, articleFolder).setTrashed(true);
  }
  
  // update clear copy
  var clearFile = makeClearCopy(doc, clearFileName);
  
  var clearId = clearFile.getId();
  var clearFile = DriveApp.getFileById(clearId);
  
  // get blob with DOCX content and save into file
  var content = convertToDocx(clearId);
  var docxFile = DriveApp.createFile(content);
  docxFile.setName(fileName);
  
  // add file to article folder and remove file from root folder
  var articleFolder = clearFile.getParents().next();
  articleFolder.addFile(docxFile);
  DriveApp.getRootFolder().removeFile(docxFile);
  
  DocumentApp.getUi().alert('New DOCX file with the name ' 
                            + clearFile.getName() 
                            + ' created in the article folder');
}


/*
* Workaround to convert to DOCX format 
*/
function convertToDocx(docId) {
  var file = Drive.Files.get(docId);
  var url = file.exportLinks['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  var oauthToken = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + oauthToken
    }
  });
  return response.getBlob();
}

/*
* Remove sections from the document
*/
function removeSectionTagsFromDoc(docId) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  var rangeElement = body.findText('←[^→]*→');
  while(rangeElement) {
    var element = rangeElement.getElement().getParent();
    element.removeFromParent();
    rangeElement = body.findText('←[^→]*→', rangeElement);
  }
  // save doc in the end of editing
  doc.saveAndClose();
}
