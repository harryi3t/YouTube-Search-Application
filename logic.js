var cached_items;

$(document).ready(function(){
	$('select').formSelect();
	$('select').change(function () {
		fill_results(cached_items, $('#sort-select').val());
	});
});

// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
	$('#search-button').attr('disabled', false);
	$('#sort-select').attr('disabled', false);
}

// Search for a specified string.
// gapi.client.init();
function search() {
	var q = $('#query').val();
	
	var request = gapi.client.youtube.search.list({
		q: q,
		maxResults: 15,
		part: 'snippet'
	});


	request.execute(function(response) {

		cached_items = response.result.items;

		// var sort_instance = M.FormSelect.getInstance($('#form-select'));
		var sort_by = $('#sort-select').val();

		fill_results(cached_items, sort_by);
	});
}

function fill_results (items, sort_by) {
	console.log(items, sort_by);

	if (!items || !items.length)
		return;

	items.map(item => {
		var temp;
		temp = item;
		temp.snippet.publishedAt = (new Date(temp.snippet.publishedAt)).getTime();
		return temp;
	})

	sort_items(items, sort_by);

	var $row = $(document.createElement('div')).addClass('row'); 
	var $search_container = $('#search-container');

	$search_container.html('');


	for(i = 0; i < items.length; i++ ) {
		
		if (items[i].id.kind != 'youtube#video')
			continue;
		
		console.log(items[i].snippet.publishedAt, items[i].snippet.title);
		var $row_abs = $(document.createElement('div')).addClass('col s12 m4')
							.css('height', '600px'); 
		var $card = $(document.createElement('div')).addClass('card'); 

		var $card_image = $(document.createElement('div')).addClass('card-image'); 
		var $thumbnail = $(document.createElement('img')).attr('src', items[i].snippet.thumbnails.high.url)
										.addClass('activator');
		var title = items[i].snippet.title;
		title = title.length > 50 ? title.substr(0, 50) + ' ...' : title;										
		var $heading = $(document.createElement('span')).addClass('card-title')
										.text(title);
		var $play_button = $(document.createElement('a')).addClass('btn-floating halfway-fab waves-effect waves-light red')
										.attr('href', 'https://www.youtube.com/watch?v=' + items[i].id.videoId )
										.attr('target', '_blank' );
		var $play_icon = $(document.createElement('i')).addClass('material-icons').text('play_circle_filled');
		$play_button.append($play_icon);

		$card_image.append($thumbnail);
		$card_image.append($play_button);
		// $card_image.append($heading);

		var $card_content = $(document.createElement('div')).addClass('card-content'); 
		var $desc = $(document.createElement('p'))
								.text(items[i].snippet.description);

		$card_content.append($heading);
		$card_content.append($desc);

		$card.append($card_image);
		$card.append($card_content);
		$row_abs.append($card);
	
		$row.append($row_abs);
	}

	$row.append($row_abs);
	$search_container.append($row);
}

function sort_items(items, sort_by) {
	if (!sort_by)
		return;

	var len = items.length;
	var unsorted;
	var x, y;


	// As number of elemnts is very less, thus using bubble sort wil work for our use case.
	for (i = 0; i < len; i++) {
		unsorted = false;
		for (j = 0; j < len-i-1; j++) {
			if (sort_by == 'title') {
				x = items[j].snippet[sort_by].replace("\"", "");
				y = items[j+1].snippet[sort_by].replace("\"", "");
				if (x > y) {
					var temp = items[j];
					items[j] = items[j+1];
					items[j+1] = temp;
					unsorted = true;
				}	
			}
			else if (sort_by == 'publishedAt') {
				if (items[j].snippet[sort_by] < items[j+1].snippet[sort_by]) {
					var temp = items[j];
					items[j] = items[j+1];
					items[j+1] = temp;
					unsorted = true;
				}	
			}
			
		}
		if (!unsorted)
			return;
	}
}
