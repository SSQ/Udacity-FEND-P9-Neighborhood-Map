'use strict';
var locations = [{
	title: 'NYC',
	location: {
		lat: 40.7127,
		lng:  -74.0059
	}
}, {
	title: 'Washington, D.C.',
	location: {
		lat: 38.904722,
		lng: -77.016389
	}
}, {
	title: 'Boston',
	location: {
		lat: 42.358056,
		lng: -71.063611
	}
}, {
	title: 'New Haven',
	location: {
		lat: 41.31,
		lng: -72.923611
	}
}, {
	title: 'New Jersey',
	location: {
		lat: 40,
		lng: -74.5
	}
}, {
	title: 'Philadelphia',
	location: {
		lat: 39.95,
		lng: -75.166667
	}
}];

// googleError
var googleError = function() {
	  alert("Google map unavilable")
};

var map;
var marker;
var wikicontent;
var wikiData;
var url;

var menu = document.querySelector('#menu');
var drawer = document.querySelector('.nav');

menu.addEventListener('click', function(e) {
		drawer.classList.toggle('open');
		e.stopPropagation();
});

// initialize map
function initMap() {
		map = new google.maps.Map(document.getElementById('map'), {
				center: {
						// lat: 40.7413549,
						// lng: -73.9980244
						lat: 40.7127,
						lng:  -74.0059
				},
				zoom: 7,
				mapTypeControl: false
		});
		ko.applyBindings(new ViewModel());
}

// create place link to ViewModel
var Place = function(data) {
		this.title = data.title;
		this.location = data.location;
};

// ViewModel
var ViewModel = function() {
		var self = this;
		//this.locationlist = ko.observableArray([]);
		this.list = ko.observableArray([]);
		//this.markers = ko.observableArray([]);

		this.filter = ko.observable('');

		locations.forEach(function(location) {
				//self.locationlist.push(new Place(location));
				self.list.push(new Place(location));
		});
		//console.log(self.locationlist());

	// display locationlist dynamically
		self.locationlist = ko.computed(function() {
				return ko.utils.arrayFilter(self.list(), function(locationlist) {
						if (locationlist.title.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0) {
								if (locationlist.marker) {
										locationlist.marker.setVisible(true);
										map.setCenter(locationlist.marker.position);
								}
								return true;
						} else {
								locationlist.marker.setVisible(false);
								largeInfowindow.close();
								return false;
						}
				});
		}, self);

	// information window
		var largeInfowindow = new google.maps.InfoWindow();

	// create marker for each location
		self.locationlist().forEach(function(location) {
				marker = new google.maps.Marker({
						map: map,
						position: location.location,
						animation: google.maps.Animation.DROP,
						title: location.title,
						visible: true,
				});
				//self.markers().push(marker);
				location.marker = marker;
				console.log('location:     '+location);
				console.log('location.marker:        '+location.marker);

		// click the marker while open the information window
				//console.log('location         :'+location);
				marker.addListener('click', function() {
					//console.log('marker           :'+marker);
						Wiki(location,function(wikicontent) {
							//console.log('wikicontent        :'+wikicontent);
								populateInfoWindow(location.marker, largeInfowindow);
						});
				});
		});


	// wiki api
		function Wiki(location, callback) {
				var street = location.title;
				var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + street + '&format=json&callback=wikiCallback';
				var wikiRequestTimeout = setTimeout(function() {
						alert("Unfortunately, Wikipedia is unavailable. Please try again later.");
				}, 5000);

				// console.log('street:        '+street);
				// console.log('wikiUrl:         '+wikiUrl);
		//response data via jsonp
				$.ajax({
						url: wikiUrl,
						dataType: "jsonp",
						jsonp: "callback",
						success: function(response) {

								var wikiList = response[1];
				        // console.log('response:        '+response);
								// console.log('wikiList:        '+wikiList);

								var wikiData = wikiList[wikiList.length - 1];
								var url = 'http://en.wikipedia.org/wiki/' + wikiData;
								//console.log(url);

								wikicontent = '<h6>Wikipedia</h6>' + '<h6><a href="' + url + '">' + wikiData + '</a></h6>';
								//console.log('wikicontent:      ' + wikicontent);
								clearTimeout(wikiRequestTimeout);
								callback(wikicontent);
						}
				});
		};


	// when click marker, run this function to open information window and marker bounce
		function populateInfoWindow(marker, infowindow) {
			// Check to make sure the infowindow is not already opened on this marker.
				if (infowindow.marker != marker) {
						infowindow.marker = marker;
						// Wiki(marker.location);
						marker.setAnimation(google.maps.Animation.BOUNCE);
						setTimeout(function() {
								marker.setAnimation(null);
						}, 1000);
						// Wiki(marker.location);
						// console.log(marker.location);
						infowindow.setContent(wikicontent + '<hr>' + '<div>' + marker.title + '</div>');
						console.log('information window :  '+ wikicontent);
						infowindow.open(map, marker);
						// Make sure the marker property is cleared if the infowindow is closed.
						infowindow.addListener('closeclick', function() {
								infowindow.marker = null;
						});
				}
		}


	// when click the marker inside the list open the information window
		self.setmarker = function(data) {

				data.marker.setVisible(true);

				data.marker.setAnimation(google.maps.Animation.BOUNCE);
				Wiki(data,function(wikicontent) {
					//console.log('wikicontent        :'+wikicontent);
						populateInfoWindow(data.marker, largeInfowindow);
				});

				//populateInfoWindow(data.marker, largeInfowindow);

				setTimeout(function() {
						data.marker.setAnimation(null);
				}, 1000);

				map.setCenter(data.marker.position);
		}
};

//console.log(wikiList);

//  for (var i = 0; i < wikiList.length; i++) {
//      wikiData = wikiList[i];
//      var url = 'http://en.wikipedia.org/wiki/' + wikiData;
// 		 console.log(url);
//  }
//


// 	for (var i = 0; i < self.locationlist().length; i++) {
// 		marker = new google.maps.Marker({
// 			map: map,
// 			position: self.locationlist()[i].location,
// 			animation: google.maps.Animation.DROP,
// 			title: self.locationlist()[i].title,
// 			visible: true,
// 			id: i
// 		});
//
// 		self.markers().push(marker);
//
// 		marker.addListener('click', function() {
// 			populateInfoWindow(this, largeInfowindow);
// 			self.setmarker;
// 		});
//
// 		self.locationlist()[i].marker = marker;
//
//
// 		// load wikipedia data
//
// 		var street = self.locationlist()[i].title;
// console.log(street);
// 		//var wikicontentalert = '<hr>';
// 		var wikicontent = '';
//
// 		var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+street+'&format=json&callback=wikiCallback';
// console.log(wikiUrl);
//
// 		var wikiRequestTimeout = setTimeout(function(){
// 				alert('wiki unavilable!')//wikicontentalert = 'wiki unavilable!'+'<hr>';
// 		},8000);
//
//
// 		$.ajax(wikiUrl,{
//
// 			dataType: "jsonp",
// 			success: function(response) {
// 				var articleList = response[1];
// 				var articleStr;
// 				for(var i=0;i<articleList.length;i++) {
// 					articleStr = articleList[i];
// 					var url = 'http://en.wikipedia.org/wiki/'+articleStr;
// 					console.log(url);
//
// 					wikicontent = '<li>wikipedia:<a href="'+url+'">'+articleStr+'</a></li>';
// 				};
// 				clearTimeout(wikiRequestTimeout);
// 			}
// 		})
//
//
//
// 	};


// ko.applyBindings(new ViewModel());
