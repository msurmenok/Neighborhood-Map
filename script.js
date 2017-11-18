// Array of places in Redwood City, CA
var places = [
    {
        title: 'Palace Of Fine Arts',
        location: {
           lat: 37.801990,
            lng: -122.448658
        }

    },
    {
        title: 'Japanese Tea Garden',
        location: {
            lat: 37.770084,
            lng: -122.470430
        }

    },
    {
        title: 'Sutro Baths',
        location: {
            lat: 37.780425,
            lng: -122.513658
        }

    },
    {
        title: 'San Mateo County History Museum',
        location: {
            lat: 37.486985,
            lng: -122.229644
        }

    },
    {
        title: 'Bair Island Wildlife Refuge & Trail',
        location: {
            lat: 37.498916,
            lng: -122.224590
        }

    },
    {
        title: 'Computer History Museum',
        location: {
            lat: 37.414300,
            lng: -122.077452
        }

    },
    {
        title: 'Dragon\'s Gate',
        location: {
            lat: 37.790695,
            lng: -122.405613
        }

    },
    {
        title: 'Stanford University',
        location: {
            lat: 37.427416,
            lng: -122.169822
        }

    },
    {
        title: 'Pacifica Municipal Pier',
        location: {
            lat: 37.633394,
            lng: -122.496260
        }
    }
];

places = places.sort(function(a,b) {return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0);});

// Google Map
var map;
var markers = [];
var infowindow;
var chosenMarker;
var wikiInfo;

var pinIcon;
var pinIconChosen;

// Wikipedia
//var wikiUrl;



function initMap() {
    pinIcon = new google.maps.MarkerImage(
        "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|ff9008",
        null, /* size is determined at runtime */
        null, /* origin is 0,0 */
        null, /* anchor is bottom center of the scaled image */
        new google.maps.Size(25,41)
    );

    pinIconChosen = new google.maps.MarkerImage(
        "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|ff3f35",
        null, /* size is determined at runtime */
        null, /* origin is 0,0 */
        null, /* anchor is bottom center of the scaled image */
        new google.maps.Size(28,44)
    );


    map = new google.maps.Map(document.querySelector('#map'), {
        center: places[0].location,
        zoom: 13
    });

    infowindow = new google.maps.InfoWindow();

    createMarkers(places);
}

// Create markers for specified places
function createMarkers(places) {
    removeMarkers();
    var bounds = new google.maps.LatLngBounds();
    for(var i = 0; i < places.length; i++) {
        var marker = new google.maps.Marker({
            position: places[i].location,
            map: map,
            title: places[i].title,
            icon: pinIcon
        });
        marker.addListener('mouseover', wrapMarkAsChosen);
        marker.addListener('mouseout', wrapMarkAsUnchosen);
        marker.addListener('click', wrapPopulateInfoWindow);
        markers.push(marker);
        bounds.extend(marker.position);
    }
    map.fitBounds(bounds);
}

// Wrap functions
function wrapMarkAsChosen() {
    return markAsChosen(this);
}

function wrapMarkAsUnchosen() {
    return markAsUnchosen(this);
}

function wrapPopulateInfoWindow() {
    return populateInfoWindow(this, infowindow);
}

// Populate infowindow for specific marker
// Only one infowindow at a time


function populateInfoWindow(marker, infowindow) {
    chosenMarker = marker;
    if(infowindow.marker != marker) {
        infowindow.marker = null;
        markers.forEach(function (t) { markAsUnchosen(t); });
        markAsChosen(marker);
        infowindow.setContent('');
        infowindow.marker = marker;
        // Street view
        var streetViewService = new google.maps.StreetViewService();
        wikiInfo = '';


        // Add information from Wikipedia
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + marker.title + '&callback=wikiCallback';
        $.ajax({
            url: wikiUrl,
            dataType: 'jsonp',
            success: function(data) {
                var titles = data[1];
                var links = data[3];
                wikiInfo = '<p><strong>Wikipedia links:</strong><br>';
                for(var i = 0; i < titles.length && i < 3; i++) {
                    wikiInfo += '<a href=' + links[i] + '>' + titles[i] + '</a><br>';
                }
                wikiInfo += '</p>'
                if(titles.length == 0) {
                    wikiInfo = '<p>Wikipedia information is not available for the location.</p>'
                }
                streetViewService.getPanoramaByLocation(marker.position, 50, getStreetView);
            }
        });

        streetViewService.getPanoramaByLocation(marker.position, 50, getStreetView);

        infowindow.open(map, marker);
        infowindow.addListener('closeclick', function () {
            var currentMarker = infowindow.marker;
            infowindow.marker = null;
            markAsUnchosen(currentMarker);
        });
    } else if (infowindow.marker == marker) {
        var currentMarker = infowindow.marker;
        infowindow.marker = null;
        markAsUnchosen(currentMarker);
        infowindow.close();
    }
}


// Get streetview and populate infowindow
function getStreetView(data, status) {
    if(status === 'OK') {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, chosenMarker.position
        );
        infowindow.setContent('<h5>' + chosenMarker.title + '</h5>' + wikiInfo + '<div class="wiki-info"></div><div id="pano"></div>');
        var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
                heading: heading,
                pitch: 10
            }
        };
        var panorama = new google.maps.StreetViewPanorama(document.querySelector('#pano'), panoramaOptions);
    } else {
        infowindow.setContent('<h5>' + chosenMarker.title + '</h5>' + wikiInfo + '<div class="wiki-info"></div><div>No Street View Found</div>');
    }
}


// Set icon when mouse over a marker
function markAsChosen(marker) {
    marker.setIcon(pinIconChosen);
}


// Set icon when mouse out of a marker
function markAsUnchosen(marker) {
    if(infowindow.marker !== marker) {
        marker.setIcon(pinIcon);
    }
}


// Remove all markers from the map and clear the array
function removeMarkers() {
    for(var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}


// Return marker with specific title
function findMarkerByTitle(title) {
    for(var i = 0; i < markers.length; i++) {
        if(title == markers[i].title) {
            return markers[i];
        }
    }
    return null;
}


// Knockout JS
function AppViewModel() {
    this.filter = ko.observable("");

    this.filteredItems = ko.computed(function () {
        var filter = this.filter().toLowerCase();
        if (!filter) {
            return places;
        } else {
            var filteredPlaces = places.filter(function(place) {
               var title = place.title.toLowerCase();
               return title.indexOf(filter) !== -1;
            });

            return filteredPlaces;
        }
    }, this);

    this.filteredItems.subscribe(function(filteredPlaces) {
        createMarkers(filteredPlaces);
    });


    // Hover over markers
    this.goOverMarker = function (text) {
        var marker = findMarkerByTitle(text.title);
        markAsChosen(marker);
    };

    this.goOutMarker = function (text) {
        var marker = findMarkerByTitle(text.title);
        markAsUnchosen(marker);
    };

    this.clickMarker = function(text) {
        var marker = findMarkerByTitle(text.title);
        populateInfoWindow(marker, infowindow);
    };
}


// Activates knockout.js
ko.applyBindings(new AppViewModel());