/*
* Calling appropriate functions to process search results
*/
function testingNcbi(term, type) {
  if(type == 'pubmed') {
    var db = 'pubmed';
    var ids = searchNcbiIds(term, db);
    var data = searchNcbi(ids, db);
    return parsePubmed(data);
  } else if(type == 'ncbi-gene') {
    var db = 'gene';
    var ids = searchNcbiIds(term, db);
    var data = searchNcbi(ids, db);
    return parseNcbiGene(data);
  } else if(type == 'ncbi-protein') {
    var db = 'protein';
    var ids = searchNcbiIds(term, db);
    var data = searchNcbi(ids, db);
    return parseNcbiProtein(data);
  } else if(type == 'ncbi-genome') {
    var db = 'genome';
    var ids = searchNcbiIds(term, db);
    var data = searchNcbi(ids, db);
    return parseNcbiGenome(data);
  } else if(type == 'ncbi-taxonomy') {
    var db = 'taxonomy';
    var ids = searchNcbiIds(term, db);
    var data = searchNcbi(ids, db);
    return parseNcbiTaxonomy(data);
  }
}

/*
* Search for NCBI IDs
*/
function searchNcbiIds(term, db) {
  var baseUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
  var url = baseUrl + '?db=' + db + '&term=' + term + '&retmode=json';
  var response = UrlFetchApp.fetch(url);
  response = JSON.parse(response);
  var ids = response['esearchresult']['idlist'];
  return ids.join(',');
}

/*
* Get search results for selected NCBI IDs
*/
function searchNcbi(ids, db) {
  var baseUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
  var url = baseUrl + '?db=' + db + '&id=' + ids + '&retmode=json';
  var response = UrlFetchApp.fetch(url);
  
  response = JSON.parse(response);    
  return response['result'];
}

/*
* Parse PUBMED search results
*/
function parsePubmed(data) {
  if(data) {
    var ids = data['uids'];
    var results = [];
    var baseUrl = 'http://www.ncbi.nlm.nih.gov/pubmed/';
    for (var i = 0; i < ids.length; i++) {
      var result = data[ids[i]];
      var ncbi_url = baseUrl + result['uid'];
      var ncbi_id = result['uid'];
      var ncbi_name = result['title'];
      var ncbi_authors = getAuthors(result['authors']);
      results.push({url: ncbi_url, 
                    id: ncbi_id, 
                    name: ncbi_name, 
                    authors: ncbi_authors, 
                    type: 'pubmed', 
                    desc:  ncbi_authors});
    }
    return results;
  } else {
    return false;
  }
}

/*
* Parse NCBI Gene search results
*/
function parseNcbiGene(data) {
  if(data) {
    var ids = data['uids'];
    var results = [];
    var baseUrl = 'http://www.ncbi.nlm.nih.gov/gene/';
    for (var i = 0; i < ids.length; i++) {
      var result = data[ids[i]];
      var ncbi_url = baseUrl + result['uid'];
      var ncbi_id = result['uid'];
      var ncbi_name = result['name'] + '(' + result['description']  + ')';
      //var ncbi_authors = getAuthors(result['authors']);
      var ncbi_desc = result['summary'];
      results.push({url: ncbi_url, 
                    id: ncbi_id, 
                    name: ncbi_name, 
                    type: 'ncbi-gene', 
                    desc:  ncbi_desc});
    }
    return results;
  } else {
    return false;
  }
}

/*
* Parse NCBI Protein search results
*/
function parseNcbiProtein(data) {
  if(data) {
    var ids = data['uids'];
    var results = [];
    var baseUrl = 'http://www.ncbi.nlm.nih.gov/protein/';
    for (var i = 0; i < ids.length; i++) {
      var result = data[ids[i]];
      var ncbi_url = baseUrl + result['uid'];
      var ncbi_id = result['uid'];
      var ncbi_name = result['title'];
      var ncbi_desc = 'Genome: ' + result['genome'] + ';<br />Subtype: ' 
                       + result['subtype'] + ';<br />Subname: ' + result['subname'];
      results.push({url: ncbi_url, 
                    id: ncbi_id, 
                    name: ncbi_name, 
                    type: 'ncbi-protein', 
                    desc:  ncbi_desc});
    }
    return results;
  } else {
    return false;
  }
}

/*
* Parse NCBI Genome search results
*/
function parseNcbiGenome(data) {
  if(data) {
    var ids = data['uids'];
    var results = [];
    var baseUrl = 'http://www.ncbi.nlm.nih.gov/genome/';
    for (var i = 0; i < ids.length; i++) {
      var result = data[ids[i]];
      var ncbi_url = baseUrl + result['uid'];
      var ncbi_id = result['uid'];
      var ncbi_name = result['organism_name'];
      var ncbi_desc = result['defline'] + '<br />Organizm kingdom: ' 
                      + result['organism_kingdom'] + ';<br />Organism group: ' 
                      + result['organism_group'] + ';<br />Organism subgroup: ' + result['organism_subgroup'];
      results.push({url: ncbi_url, 
                    id: ncbi_id, 
                    name: ncbi_name, 
                    type: 'ncbi-genome', 
                    desc:  ncbi_desc});
    }
    return results;
  } else {
    return false;
  }
}

/*
* Parse NCBI Taxonomy search results
*/
function parseNcbiTaxonomy(data) {
  if(data) {
    var ids = data['uids'];
    var results = [];
    var baseUrl = 'http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=';
    for (var i = 0; i < ids.length; i++) {
      var result = data[ids[i]];
      var ncbi_url = baseUrl + result['uid'];
      var ncbi_id = result['uid'];
      var ncbi_name = result['scientificname'];
      var ncbi_desc = 'Genbank common name: ' 
                      + result['commonname'] + ';<br />Inherited blast name: ' 
                      + result['division'] + ';<br />Rank: ' + result['rank'];
      results.push({url: ncbi_url, 
                    id: ncbi_id, 
                    name: ncbi_name, 
                    type: 'ncbi-taxonomy', 
                    desc:  ncbi_desc});
    }
    return results;
  } else {
    return false;
  }
}

/*
* Get author names from from search results 
*/
function getAuthors(data) {
  var result = [];
  for(var i = 0; i < data.length; i++) {
    result.push(data[i]['name']);
  }
  return result.join(', ');
}

