// Array of places in Redwood City, CA
var places = [
    {
        title: 'County History Museum',
        lat: 37.487017,
        lng:  -122.229660
    },
    {
        title: 'Bair Island Ecological Reserve',
        lat: 37.520700,
        lng: -122.225591
    },
    {
        title: 'Whole Foods',
        lat: 37.482368,
        lng: -122.231693
    },
    {
        title: 'Redwood Downtown 20 and XD',
        lat: 37.486213,
        lng: -122.228881
    },
    {
        title: 'Blu Harbor',
        lat: 37.499957,
        lng: -122.223999
    },
    {
        title: 'Redwood City DMV',
        lat: 37.492581,
        lng: -122.229020
    },
    {
        title: 'Trader Joe\'s',
        lat: 37.496354,
        lng: -122.248546
    },
    {
        title: 'Costco',
        lat: 37.478404,
        lng: -122.216502
    }
];

// Google Map
var map;
var markers = [];

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
    createMarkers(places);
}

function createMarkers(places) {
    removeMarkers();
    for(var i = 0; i < places.length; i++) {
        var marker = new google.maps.Marker({
            position: {lat: places[i].lat, lng: places[i].lng},
            map: map,
            title: places[i].title,
            icon: pinIcon
        });
        marker.addListener('mouseover', function () {
            this.setIcon(pinIconChosen);
        });
        marker.addListener('mouseout', function () {
            this.setIcon(pinIcon);
        })
        markers.push(marker);
    }
}




function removeMarkers() {
    for(var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
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
        for(var i = 0; i < markers.length; i++) {
            if(text.title == markers[i].title) {
                google.maps.event.trigger(markers[i], 'mouseover');
            }
        }
    }

    this.goOutMarker = function (text) {
        for(var i = 0; i < markers.length; i++) {
            if(text.title == markers[i].title) {
                google.maps.event.trigger(markers[i], 'mouseout');
            }
        }
    }
}


// Activates knockout.js
ko.applyBindings(new AppViewModel());