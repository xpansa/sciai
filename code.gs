/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Show Sidebar', 'showSidebar')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 */
function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('Structured')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  DocumentApp.getUi().showSidebar(ui);
}

/**
 * Gets the text the user has selected. If there is no selection,
 * this function displays an error message.
 *
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
        // Only translate elements that can be edited as text; skip images and
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
      throw 'Please select some text.';
    }
    return text;
  } else {
    throw 'Please select some text.';
  }
}

/**
 * Gets the user-selected text and translates it from the origin language to the
 * destination language. The languages are notated by their two-letter short
 * form. For example, English is 'en', and Spanish is 'es'. The origin language
 * may be specified as an empty string to indicate that Google Translate should
 * auto-detect the language.
 *
 * @param {string} origin The two-letter short form for the origin language.
 * @param {string} dest The two-letter short form for the destination language.
 * @param {boolean} savePrefs Whether to save the origin and destination
 *     language preferences.
 * @return {string} The result of the translation.
 */
function runProcessing(type, id) {
  var text = getSelectedText();

  var processed = [];
  if (id) {
    for (var i = 0; i < text.length; i++) {
    //Logger.log(text[i]);
      processed.push('<' + type + ' id="' +id + '">' + text[i]+ '</' + type + '>');
    }
  }
  else {
    for (var i = 0; i < text.length; i++) {
    //Logger.log(text[i]);
      processed.push('<' + type + '>' + text[i]+ '</' + type + '>');
    }
  }
  

  return processed.join('\n');
}

function searchTerm() {
  var term = getSelectedText();
  var data = [{id: "B0LXF7", type: "protein" , name: "Aprotinin", description: "Organism: Sus scrofa (Pig)", synonyms: ""},
{id: "Q7M311", type: "protein", name: "Isoaprotinin G1", description: "Organism: Bos indicus x Bos taurus (Hybrid cattle)", synonyms: ""},
{id: "Q7M312", type: "protein", name: "Isoaprotinin G2", description: "Organism: Bos indicus x Bos taurus (Hybrid cattle)", synonyms: ""},
{id: "DB06692", type: "drug", name: "Aprotinin", description: "Aprotinin, also known as bovine pancreatic trypsin inhibitor, BPTI (Trasylol, Bayer) is a protein, that is used as medication administered by injection to reduce bleeding during complex surgery, such as heart and liver surgery.", synonyms: "bovine pancreatic trypsin inhibitor, BPTI, Iniprol, Trazinin"},
{id: "SMP00288", type: "pathway", name: "Aprotinin Action Pathway", description: "Aprotinin inhibits several serine proteases, specifically trypsin, chymotrypsin and plasmin at a concentration of about 125,000 IU/ml, and kallikrein at 300,000 IU/ml.", synonyms: ""},
{id: "P81715", type: "protein", name: "Leupeptin-inactivating enzyme 1", description: "Gene: lieA; Organism: Streptomyces exfoliatus (Streptomyces hydrogenans)", synonyms: ""},
{id: "P83913", type: "protein", name: "Leupeptin-inactivating enzyme 2", description: "Gene: lieB; Organism: Streptomyces exfoliatus (Streptomyces hydrogenans)", synonyms: ""},
{id: "A0A0D5BMD6", type: "protein", name: "Leupeptin-inactivating enzyme 1", description: "Gene: lieA; Organism: Elizabethkingia sp. BM10", synonyms: ""},
{id: "K1M2K7", type: "protein", name: "Leupeptin-inactivating enzyme 1", description: "Gene: lieA; Organism: Cecembia lonarensis LW9", synonyms: ""},
{id: "SMP00288", type: "protein", name: "Leupeptin-inactivating enzyme 1", description: "Gene: SVTN_22375; Organism: Streptomyces vietnamensis", synonyms: ""},
{id: "3413132", type: "pub", name: "Sequencing of proteins from two-dimensional gels by using in situ digestion and transfer of peptides to polyvinylidene difluoride membranes: application to proteins associated with sensitization in Aplysia.", description: "We have developed a method for obtaining partial internal amino acid sequence data from proteins isolated directly from preparative two-dimensional polyacrylamide gels. Proteins from a crude cell homogenate are separated using preparative two-dimensional polyacrylamide gel electrophoresis...", synonyms: ""},
{id: "2226415", type: "pub", name: "Identification of rat liver glutathione S-transferase Yb subunits by partial N-terminal sequencing after electroblotting of proteins onto a polyvinylidene difluoride membrane from an analytical isoelectric focusing gel.", description: "Rat liver glutathione S-transferases were partially purified using S-hexyl glutathione affinity chromatography, followed by native isoelectric focusing employing a pH 7-11 or pH 3-10 gradient. Proteins were excised and eluted from the gel for determination of subunit composition using sodium dodecyl sulfate-polyacrylamide gel electrophoresis...", synonyms: ""},
{id: "20512674", type: "pub", name: "Gradient SDS-Polyacrylamide Gel Electrophoresis", description: "The preparation of fixed-concentration polyacrylamide gels has been described in Chapter 6. However, the use of polyacrylamide gels that have a gradient of increasing acrylamide concentration (and hence decreasing pore size) can sometimes have advantages over fixed-concentration acrylamide gels...", synonyms: ""},
{id: "7524943", type: "pub", name: "SDS-polyacrylamide gel electrophoresis of proteins", description: "No description", synonyms: ""},
{id: "16858726", type: "pub", name: "A complexomic study of Escherichia coli using two-dimensional blue native/SDS-polyacrylamide gel electrophoresis", description: "Study of the complexome - all the protein complexes of the cell - is essential for a better understanding and more global vision of cell function. Using two-dimensional blue native/SDS-PAGE (2-D BN/SDS-PAGE) technology, the cytosolic and membrane protein complexes of Escherichia coli were separated. Then, the different partners of each protein complex were identified by LC-MS/MS...", synonyms: ""},
{id: "21743220", type: "pub", name: "Sodium dodecyl sulfate polyacrylamide gel electrophoresis (SDS-PAGE) of urinary protein in acute kidney injury", description: "Recent experimental and clinical studies have shown the importance of urinary proteomics in acute kidney injury (AKI). We analyzed the protein in urine of patients with clinical AKI using sodium dodecyl sulfate polyacrylamide gel electrophoresis (SDS-PAGE) for its diagnostic value, and followed them up for 40 months to evaluate prognosis. Urine from 31 consecutive cases of AKI was analyzed with SDS-PAGE to determine the low, middle and high molecular weight proteins...", synonyms: "SDS-Polyacrylamide Gel Electrophoresis"},
{id: "0000-0001-9348-2034", type: "person", name: "Corbett T Berry", description: "No public information available", synonyms: ""},
{id: "0000-0002-6425-5980", type: "person", name: "Uri Hershberg", description: "No public information available", synonyms: ""},
{id: "0000-0001-9916-2795", type: "person", name: "Michael J. May", description: "No public information available", synonyms: ""},
];
  var searchResult = [];
  for(var i = 0, j = data.length; i < j; i++) {
	if (data[i].name.match(new RegExp(term, "i")) || data[i].description.match(new RegExp(term, "i")) || data[i].synonyms.match(new RegExp(term, "i"))) {
		searchResult.push(data[i]);
	}
}
  return searchResult;
}


/**
 * Replaces the text of the current selection with the provided text, or
 * inserts text at the current cursor location. (There will always be either
 * a selection or a cursor.) If multiple elements are selected, only inserts the
 * translated text in the first element that can contain text and removes the
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
        elements[0].getElement().getType() ==
        DocumentApp.ElementType.INLINE_IMAGE) {
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
          // Only translate elements that can be edited as text, removing other
          // elements.
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

