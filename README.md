## Project 5 Neighborhood Map
![](http://oktwqa7br.bkt.clouddn.com/Udacity/FEND/map/image/overview.png?imageslim)

![](http://oktwqa7br.bkt.clouddn.com/Udacity/FEND/map/image/function.png?imageslim)
### How to run  
1. open the main.html

###  Interface Design
 1. search input text always at the top of the body
 2. list item inside a nav. It will appear when you click hamburger button.

```
  .nav.open {
   transform: translate(0,0);
 }

 .nav {
   z-index: 10;
   width: 300px;
   position: absolute;
   background-color: white;
   /*-webkit-transform:translate(-300px,0);*/
   transform: translate(-800px,0);
   transition: transform 0.3s ease;
 }

 @media screen and (min-width:800px) {
 .nav {
   z-index: 10;
   width: 300px;
   position: absolute;
   background-color: white;
   /*-webkit-transform:translate(-300px,0);*/
   transform: translate(0,0);
   transition: transform 0.3s ease;
 }
}

<script>
  var menu = document.querySelector('#menu');
  var drawer = document.querySelector('.nav');

  menu.addEventListener('click', function(e) {
    drawer.classList.toggle('open');
    e.stopPropagation();
  });
</script>

 ```

###  App Functionality
## Filter Locations
Includes a text input field or dropdown menu that filters the map markers and list items to locations matching the text input or selection. Filter function runs error-free.

```
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
      return false;
    }
  });
}, self);
```

## List View
A list-view of location names is provided which displays all locations by default, and displays the filtered subset of locations when a filter is applied.
Clicking a location on the list displays unique information about the location, and animates its associated map marker (e.g. bouncing, color change.)
List functionality is responsive and runs error free.

```
<div class="listbox nav">
  <ul data-bind="foreach: locationlist">
    <li data-bind="text: title, click: $parent.setmarker"></li>
  </ul>
</div>

var Place = function(data) {
	this.title = data.title;
	this.location = data.location;
};

locations.forEach(function(location) {
  self.locationlist.push(new Place(location));
  self.list.push(new Place(location));
});
```

## Map and Markers
Map displays all location markers by default, and displays the filtered subset of location markers when a filter is applied.

Clicking a marker displays unique information about a location in either an infoWindow or DOM element.

Markers should animate when clicked (e.g. bouncing, color change.)

Any additional custom functionality provided in the app functions error-free.

```
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
      self.markers().push(marker);
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
```

###  App Architecture
## Proper Use of Knockout    
Code is properly separated based upon Knockout best practices (follow an MVVM pattern, avoid updating the DOM manually with jQuery or JS, use observables rather than forcing refreshes manually, etc). Knockout should not be used to handle the Google Map API.

There are at least 5 locations hard-coded in the model.

```
this.locationlist = ko.observableArray([]);
this.list = ko.observableArray([]);
this.markers = ko.observableArray([]);
```
```
ko.applyBindings(new ViewModel());
```

###  Asynchronous Data Usage
## Asynchronous API Requests
Application utilizes the Google Maps API and at least one non-Google third-party API. Refer to this documentation

All data requests are retrieved in an asynchronous manner

```
<script async defer onerror="googleError()"
    src=
    "https://maps.googleapis.com/maps/api/js?key=XXXXXXXXXXXXX&v=3&callback=initMap">
</script>

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

```
## Error Handling
Data requests that fail are handled gracefully using common fallback techniques (i.e. AJAX error or fail methods). 'Gracefully' means the user isn’t left wondering why a component isn’t working. If an API doesn’t load there should be some visible indication on the page (an alert box is ok) that it didn’t load. Note: You do not need to handle cases where the user goes offline.

```
var googleError = function() {
	alert("Google map unavilable")
};

var wikiRequestTimeout = setTimeout(function() {
  alert("Unfortunately, Wikipedia is unavailable. Please try again later.");
}, 5000);

clearTimeout(wikiRequestTimeout);
```

###  Location Details Functionality
## Additional Location Data
Functionality providing additional data about a location is provided and sourced from a 3rd party API. Information can be provided either in the marker’s infoWindow, or in an HTML element in the DOM (a sidebar, the list view, etc.)

Provide attribution for the source of additional data. For example, if using Foursquare, indicate somewhere in your UI and in your README that you are using Foursquare data.

```
 // I use wiki as a 3rd party API.
```
## Error Free
Application runs without errors.

## Usability
Functionality is presented in a usable and responsive manner.

```
// I put it into information window
```
