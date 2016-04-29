/*
* Send search query to Uniprot API
*/
function searchUniprot(term) {
  var urlBase = 'http://www.uniprot.org/uniprot/';
  var url = urlBase + '?query=' + term + '&sort=score&columns=id,protein names,entry name,genes,organism,length&limit=10&format=tab';
  var response = UrlFetchApp.fetch(url);
  var responseString = response.getContentText();
  var responseArray = parseTabFormat(responseString);
  
  return processUniprot(responseArray); 
}

/*
* Parse search results in tab format
*/
function parseTabFormat(data) {
  data = data.split(/\r?\n/);
  data.shift();
  data.pop();
  var uniprotTab = [];
  for(var i = 0; i < data.length; i++) {
    uniprotTab.push(data[i].split(/[\t]+/));
  }
  return uniprotTab;
}

/*
* Process search results
*/
function processUniprot(uniprotTab) {
  var processedProteins = [];
  var urlBase = 'http://www.uniprot.org/uniprot/';
  for (var i = 0; i < uniprotTab.length; i++) {
    var protein = uniprotTab[i];
    var uniprot_url = urlBase + protein[0];
    var uniprot_name = protein[1];
    var uniprot_id = protein[0];
    var unirpot_desc = 'Gene names: ' + protein[3] + ';<br />Organizm: ' + protein[4] + ';<br />Length: ' + protein[5] ;
    processedProteins.push({url: uniprot_url, id: uniprot_id, name: uniprot_name, type: 'protein', desc:  unirpot_desc});
  }
  return processedProteins;
}
