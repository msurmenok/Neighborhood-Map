
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
    }
];


function AppViewModel() {
    this.items = ko.observableArray(places);
    this.filter = ko.observable("");

    this.filteredItems = function () {
        var filter = this.filter().toLowerCase();
        if (!filter) {
            return ko.observableArray(places);
        } else {
            var filtered_places = places.filter(function(place) {
               var title = place.title.toLowerCase();
               return title.indexOf(filter) !== -1;
            });
            return ko.observableArray(filtered_places);

            // return ko.utils.arrayFilter(this.items(), function (item) {
            //     var title = item.title.toLowerCase();
            //     return title.indexOf(filter) !== -1;
            //     //return stringStartsWith(item.title.toLowerCase(), filter);
            // });
        }

    }
}


// Activates knockout.js
ko.applyBindings(new AppViewModel());