/*
*
* Standarts files includes functions that control styles and structures.
* Another words, all static objects
*
*/

/*
* Get styles for the selected element.
* This function provide correct styles for element in case of using 
* highlight feature
* @param {string} type Type of element that should be highlighted
*/
function getStyles(type) {
  var styles = {};
  // styles for terms
  styles.term = {};
  styles.term[DocumentApp.Attribute.BACKGROUND_COLOR] = '#b6d7a8'; 
  // styles for sections
  styles.section = {};
  styles.section[DocumentApp.Attribute.FONT_SIZE] = 9; 
  styles.section[DocumentApp.Attribute.FOREGROUND_COLOR] = '#757575';
  // styles for custom tags
  styles.custom = {};
  styles.custom[DocumentApp.Attribute.BACKGROUND_COLOR] = '#FFEB3B';
  // default styles (can be used when necessary to remove highlighting
  styles.none = {};
  styles.none[DocumentApp.Attribute.FOREGROUND_COLOR] = '#000000'; 
  styles.none[DocumentApp.Attribute.BACKGROUND_COLOR] = '#ffffff';
  return styles[type];  
}

/*
* This function provide correct empty structure of different types of documents.
* @param {string} type Document type name
*/
function getStructure(type) {
  var structures = {};
  structures.articles = ['Title', 'Authors', 'Abstract', 
                         'Introduction', 'Method', 'Result', 
                         'Discussions'];
  return structures[type];
}
