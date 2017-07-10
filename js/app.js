'use strict';

// Here's our Locations wich will be displayed
var locationsArray = [{
        name: 'Colégio Alfa',
        category: 'school',
        lat: -22.788727,
        lng: -43.310884
    },
    {
        name: 'Colégio Futuro VIP',
        category: 'school',
        lat: -22.795189,
        lng: -43.305025
    },
    {
        name: 'Colégio Miguel Couto',
        category: 'school',
        lat: -22.792718,
        lng: -43.302053
    },
    {
        name: 'Experimenta Lanches',
        category: 'food',
        lat: -22.789602,
        lng: -43.305044
    },
    {
        name: 'McDonalds',
        category: 'food',
        lat: -22.788064,
        lng: -43.286787
    },
    {
        name: 'Caxias DOr',
        category: 'healthcare',
        lat: -22.795383,
        lng: -43.296057
    },
    {
        name: 'Hospital Mario Leoni',
        category: 'healthcare',
        lat: -22.786285,
        lng: -43.305555
    },
    {
        name: 'Caxias Shopping',
        category: 'shopping',
        lat: -22.787374,
        lng: -43.286615
    },
    {
        name: 'Prezunic',
        category: 'supermarkets',
        lat: -22.791585,
        lng: -43.311999
    },
    {
        name: 'Carrefour',
        category: 'supermarkets',
        lat: -22.793237,
        lng: -43.300638
    },
    {
        name: 'Prefeitura',
        category: 'utilities',
        lat: -22.791882,
        lng: -43.302878
    },
    {
        name: 'Delegacia',
        category: 'utilities',
        lat: -22.78919,
        lng: -43.307229
    },
    {
        name: 'Rodoviária',
        category: 'transport',
        lat: -22.792189,
        lng: -43.310843
    },
    {
        name: 'Estação de Trem',
        category: 'transport',
        lat: -22.787146,
        lng: -43.309499
    },
];

// I'll put them into categories, to filter our searching
var categoriesArray = [{
        name: 'school',
        formattedName: 'Schools'
    },
    {
        name: 'food',
        formattedName: 'Foods'
    },
    {
        name: 'healthcare',
        formattedName: 'Health'
    },
    {
        name: 'shopping',
        formattedName: 'Shopping Center'
    },
    {
        name: 'supermarkets',
        formattedName: 'Supermarkets'
    },
    {
        name: 'utilities',
        formattedName: 'Public Utilities'
    },
    {
        name: 'transport',
        formattedName: 'Transport'
    }
];

var map;
var foursquareID;
var foursquareSecret;

function Category(data) {
    this.name = data.name;
    this.formattedName = data.formattedName;
    this.checked = ko.observable(true);
}

function PointOfInterest(location) {
    var self = this;

    // Defines attrb to Points Of Interest
    this.name = location.name;
    this.position = {
        lat: location.lat,
        lng: location.lng
    };
    this.category = location.category;
    this.visible = ko.observable(true);
    this.website = "";
    this.address = "";
    this.city = "";
    this.phone = "";
    this.icon = "";

    // Icons made by https://mapicons.mapsmarker.com/
    switch (this.category) {
        case 'school':
            this.icon = 'images/school.png';
            break;
        case 'food':
            this.icon = 'images/restaurant.png';
            break;
        case 'healthcare':
            this.icon = 'images/hospital.png';
            break;
        case 'shopping':
            this.icon = 'images/shoppingbag.png';
            break;
        case 'supermarkets':
            this.icon = 'images/supermarket.png';
            break;
        case 'utilities':
            this.icon = 'images/utilities.png';
            break;
        case 'transport':
            this.icon = 'images/transport.png';
            break;
    }

    // creates a marker for PointOfInterest
    this.marker = new google.maps.Marker({
        map: map,
        title: this.name,
        icon: this.icon,
        position: this.position
    });

    // Foursquare API to retrieve some data about our marker.
    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng +
        '&query=' + this.name + '&v=20170101&client_id=' + foursquareID + '&client_secret=' + foursquareSecret;

    var foursquareError = false;

    //  getJSON calls XHR on URL of Foursquare's API
    $.getJSON(foursquareURL)
        .done(function(data) {
            var venue = data.response.venues[0];

            self.website = (typeof(venue.url) === 'undefined' ? "" : venue.url);
            self.address = venue.location.address;
            self.city = venue.location.city;
            self.phone = (typeof(venue.contact.formattedPhone) === 'undefined' ? "" : venue.contact.formattedPhone);
        })
        .fail(function() {
            foursquareError = true;
        });

    // creates an InfoWindow
    this.infoWindow = new google.maps.InfoWindow({
        content: ""
    });

    // listener to 'click' when InfoWindow is open
    this.marker.addListener('click', function() {
        var infoHTML;

        // String with HTML code wich will be displayed on InfoWindow by clicking on a marker
        if (foursquareError) {
            infoHTML = '<p class="error">Error checking Foursquare API, please, refresh the page<br>' +
                'or try again later.</p>';
        } else {
            infoHTML = '<div class="info-window">' +
                '<div class="info-window-header">' +
                '<h1>' + self.name + '</h1>' +
                '</div>' +
                '<div class="info-window-body">' +
                '<p>' + self.address + '</p>' +
                '<p>' + self.city + '</p>';

            // what to do when we don't have a phonenumber
            if (self.phone !== "") {
                infoHTML += '<p>' + self.phone + '</p>';
            }

            // what to do when we don't have a website
            if (self.website !== "") {
                infoHTML += '<p><a href="' + self.website + '">Website</a></p>';
            }

            infoHTML += '</div></div>';
        }

        self.infoWindow.setContent(infoHTML);

        self.infoWindow.open(map, this);

        // animation of marker by clicking
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2.5 * 1000);
    });

    // This function is called when filtering the markers, showing or hiding depending on the filters applied.
    this.toggleMarker = function() {
        if (self.visible()) {
            self.marker.setMap(map);
        } else {
            self.marker.setMap(null);
        }
    };

    this.showInfo = function() {
        google.maps.event.trigger(self.marker, 'click');
    };
}

function AppViewModel() {
    var self = this;

    this.categories = ko.observableArray([]);

    categoriesArray.forEach(function(data) {
        self.categories.push(new Category(data));
    });

    this.searchString = ko.observable("");

    this.locations = ko.observableArray([]);

    // Here I putted my API key's of Foursquare
    foursquareID = "0ONGVPM4OZROS1E3UMNY5GDTQCPL3JPY0LVFBVVUVCXQ2EGP";
    foursquareSecret = "JGZ50Y0HF4NCKVJNCDNDC4J0CDYRDQWAHBKSIFZW1OKWQQFM";

    // Let's iterate over the predefined array of locales and add these to the Knockout ObservableArray
    locationsArray.forEach(function(location) {
        self.locations.push(new PointOfInterest(location));
    });

    this.getCategoryByName = function(name) {
        var ret = $.grep(self.categories(), function(e) {
            return e.name === name;
        });
        return ret[0];
    };

    // This function filters the points of interest based on the search bar string and if the category is checked as the list of menu places use foreach data-bind, they are also filtered
    this.filteredLocations = ko.computed(function() {
        return ko.utils.arrayFilter(self.locations(), function(location) {
            var filterString = self.searchString().toLowerCase();
            var locationCategory = self.getCategoryByName(location.category);
            var locationName = location.name.toLowerCase();

            var ret;

            if (!filterString) {
                ret = locationCategory.checked();
            } else {
                ret = (locationName.search(filterString) >= 0 && locationCategory.checked());
            }

            location.visible(ret);
            location.toggleMarker();
            return ret;
        });
    }, this);

    // Knockout applied to Display
    this.showMenu = ko.observable(false);

    this.toggleMenu = function() {
        this.showMenu(!this.showMenu());
    };
}

function createNeighborhoodMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -22.788003,
            lng: -43.310284
        },
        zoom: 15,
        styles: [{
                featureType: 'poi',
                stylers: [{
                    'visibility': 'off'
                }] // Hide standard Google Maps API points of interest
            },
            {
                featureType: 'transit',
                stylers: [{
                    'visibility': 'off'
                }] // Hide bus and subway stations
            }
        ]
    });

    ko.applyBindings(new AppViewModel());
}

function neighborhoodError() {
    $('#map').html('<p class="error">Error loading Google Maps, reload page, or try again later.</p>');
}
