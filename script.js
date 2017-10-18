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

function initMap() {
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
            title: places[i].title
        });
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
}


// Activates knockout.js
ko.applyBindings(new AppViewModel());