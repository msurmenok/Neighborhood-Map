// Array of places in Redwood City, CA
var places = [
    {
        title: 'County History Museum',
        location: {
           lat: 37.487017,
            lng:  -122.229660
        }

    },
    {
        title: 'Bair Island Ecological Reserve',
        location: {
            lat: 37.520700,
            lng: -122.225591
        }

    },
    {
        title: 'Whole Foods',
        location: {
            lat: 37.482368,
            lng: -122.231693
        }

    },
    {
        title: 'Redwood Downtown 20 and XD',
        location: {
            lat: 37.486213,
            lng: -122.228881
        }

    },
    {
        title: 'Blu Harbor',
        location: {
            lat: 37.499957,
            lng: -122.223999
        }

    },
    {
        title: 'Redwood City DMV',
        location: {
            lat: 37.492581,
            lng: -122.229020
        }

    },
    {
        title: 'Trader Joe\'s',
        location: {
            lat: 37.496354,
            lng: -122.248546
        }

    },
    {
        title: 'Costco',
        location: {
            lat: 37.478404,
            lng: -122.216502
        }

    },
    {
        title: 'Petco Animal Supplies',
        location: {
            lat: 37.470584,
            lng: -122.223852
        }
    }
];

// Google Map
var map;
var markers = [];
var infowindow;

var pinIcon;
var pinIconChosen;


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
        center: {lat: 37.4986064, lng: -122.229146},
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
        marker.addListener('mouseover', function() {
            return markAsChosen(this)
        });
        marker.addListener('mouseout', function() {
            return markAsUnchosen(this)
        });
        marker.addListener('click', function () {
            return populateInfoWindow(this, infowindow);
        });
        markers.push(marker);
        bounds.extend(marker.position);
    }
    map.fitBounds(bounds);
}


// Populate infowindow for specific marker
// Only one infowindow at a time
function populateInfoWindow(marker, infowindow) {

    if(infowindow.marker != marker) {
        infowindow.marker = null;
        markers.forEach(function (t) { markAsUnchosen(t); });
        markAsChosen(marker);
        infowindow.setContent('');
        infowindow.marker = marker;
        // Street view
        var streetViewService = new google.maps.StreetViewService();

        function getStreetView(data, status) {
            if(status === 'OK') {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position
                );
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 10
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(document.querySelector('#pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div><div>No Street View Found</div>');
            }
        }

        streetViewService.getPanoramaByLocation(marker.position, 50, getStreetView);

        infowindow.open(map, marker)
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
    }

    this.goOutMarker = function (text) {
        var marker = findMarkerByTitle(text.title);
        markAsUnchosen(marker);
    }

    this.clickMarker = function(text) {
        var marker = findMarkerByTitle(text.title);
        populateInfoWindow(marker, infowindow);
    }
}


// Activates knockout.js
ko.applyBindings(new AppViewModel());