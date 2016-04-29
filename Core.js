/*
*
* Core file include functions to work with add-on
* such as create sidebar, set menu items etc.
*
*/

/*
* Creates a menu entry in the Google Docs UI when the document is opened.
*/
function onOpen(e) {
  DocumentApp.getUi()
  .createMenu('SciAI')
  .addItem('Show SciAI', 'showSidebar')
  .addSeparator()
  .addItem('Save As SCI', 'exportSci')
  .addItem('Save As ClearDoc', 'exportClear')
  .addItem('Export to DOCX', 'exportDocx')
  .addItem('Export to PDF', 'exportPdf')
  .addItem('Test DP', 'testDP')
  .addToUi();
}

/*
* Runs when the add-on is installed.
*/
function onInstall(e) {
  onOpen(e);
}

/*
** Opens a sidebar in the document containing the add-on's user interface.
*/
function showSidebar() {
  var ui = HtmlService
  .createTemplateFromFile('Sidebar')
  .evaluate()
  .setTitle('SciAI')
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  DocumentApp.getUi().showSidebar(ui);
}
