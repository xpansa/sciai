$.get(chrome.extension.getURL("statusbar.html"), {}, function(data) {$('body').append(data);}, 'html');

chrome.extension.sendRequest({}, function(response) {});

$(document).ready(function(){
	countWords();
	
	$('body').on('click', '.kix-link', function(){
		e.preventDefault();
		alert('click on body'); 
		console.log('Link: ' + $(this).attr('href'));
	});
});

function countWords() {
	var pageCount = $('div.kix-page').length; 
	var wordCount = 0; 
	$('span.kix-lineview-text-block').each(function(i, obj){ 
	  wordCount += $(obj).text().split(/s+/).length; 
	}); 
	$('span#GDWC_wordsTotal').text(pageCount + ' pages, ' + wordCount + ' total words'); 
	timeout = setTimeout('countWords()', 5000); 
}
