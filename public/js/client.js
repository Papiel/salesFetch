'use strict';

var docTotalNumber = 0;
function Document(name, isStarred) {
    var self = this;
    self.name = name;
    self.isStarred = ko.observable(isStarred);
    self.id = docTotalNumber;
    docTotalNumber += 1;
    self.type = null;
    self.provider = null;

    self.toggleStarred = function() {
        this.isStarred(!this.isStarred());
    };
}

function Provider(info) {
    var self = this;
    self.isActive = ko.observable(false);

    if (info) {
        self.name = info.name;
        self.id = info.id;
        self.redirect_uri = info.redirect_uri;
        self.trusted = info.trusted;
        self.featured = info.featured;
    }

    self.toggleActive = function() {
        this.isActive(!this.isActive());
    };
}

function Type(name) {
    var self = this;
    self.name = name;
    self.isActive = ko.observable(false);

    self.toggleActive = function() {
        this.isActive(!this.isActive());
    };
}

var tabTotalNumer = 0;
function TabModel(name, display, pullRight) {
    var self = this;
    self.name = name;
    self.display = display;
    self.id = tabTotalNumer;
    tabTotalNumer += 1;
    self.pullRight = pullRight;
}

function SalesfetchViewModel() {

    var client = this;

    client.isMobile = device.mobile();
    client.isTablet = device.tablet();
    client.isDesktop = device.desktop();

    // Editable data
    client.documents = ko.observableArray([]);
    client.connectedProviders = ko.observableArray([]);
    client.types = ko.observableArray([]);
    client.availableProviders = null;

    client.filterByProvider = ko.observable(false);
    client.filterByType = ko.observable(false);

    // Return providers filtered isActive
    client.filteredProviders = ko.computed(function() {
        var activeProviders = client.connectedProviders().filter(function(provider) {
            return provider.isActive();
        });

        //update client.filterByProvider
        client.filterByProvider(activeProviders.length !== 0);

        return client.filterByProvider() ? activeProviders : client.connectedProviders();
    });

    // Return types filtered isActive
    client.filteredTypes = ko.computed(function() {
        var activeTypes = client.types().filter(function(type) {
            return type.isActive();
        });

        //update client.filterByType
        client.filterByType(activeTypes.length !== 0);

        return client.filterByType() ? activeTypes : client.types();
    });

    // Return documents filtered by providers and types
    client.filteredDocuments = ko.computed(function() {
        return client.documents().filter(function(document) {
            var providerFilter = document.provider.isActive() || !client.filterByProvider();
            var typeFilter = document.type.isActive() || !client.filterByType();
            return providerFilter && typeFilter;
        });
    });

    // Tabs
    var timelineTab = new TabModel('Timeline', 'fa-list', false);
    timelineTab.documents = client.filteredDocuments;

    var starredTab = new TabModel('Starred', 'fa-star-o', false);
    starredTab.documents = ko.computed(function() {
        return client.filteredDocuments().filter(function(document) {
            return (document.isStarred() === true);
        });
    });

    var searchTab = new TabModel('Search', 'fa-search', true);
    searchTab.documents = ko.computed(function() {
        return client.filteredDocuments().filter(function(document) {
            return (document.name.search('c') !== -1);
        });
    });

    // Set default tabs
    client.tabs = [timelineTab, starredTab, searchTab];

    // Add ProviderTab if desktop
    if (client.isDesktop) {
        client.providerTab = new TabModel('Providers', 'fa-link', false);
        client.tabs.push(client.providerTab);
    }

    client.activeTab = ko.observable();
    client.activeDocument = ko.observable();

    client.addDocument = function(json) {
        client.documents.push(client.DocumentWithJson(json));
    };

    client.addDocuments = function(array) {
        array.forEach(function(json) {
            client.addDocument(json);
        });
    };

    client.DocumentWithJson = function(json) {
        var document = new Document(json.name, json.starred);
        document.provider = client.ProviderWithName(json.provider);
        document.type = client.TypeWithName(json.type);
        return document;
    };

    client.setAvailableProviders = function(json) {
        client.availableProviders = ko.observableArray([]);
        json.forEach(function(providerInfo) {
            client.availableProviders.push(new Provider(providerInfo));
        });
    };

    client.setConnectedProvider = function(json) {
        client.connectedProviders = ko.observableArray([]);
        json.forEach(function(providerInfo) {
            client.connectedProviders.push(new Provider(providerInfo));
        });
    }

    client.ProviderWithName = function(providerName) {
        var provider = null;
        client.connectedProviders().some(function(providerIte) {
            if (providerIte.name === providerName) {
                provider = providerIte;
                return true;
            }
            return false;
        });

        if (!provider) {
            console.log('Could not find provider: '+providerName);
            provider = new Provider();
            provider.name = "none";
        }

        return provider;
    };

    client.TypeWithName = function(typeName) {
        var type = null;
        client.types().some(function(typeIte) {
            if (typeIte.name === typeName) {
                type = typeIte;
                return true;
            }
            return false;
        });

        if (!type) {
            type = new Type(typeName);
            client.types.push(type);
        }

        return type;
    };

    // Behaviours
    client.goToTab = function(tab) {
        client.activeTab(tab);

        if (client.isMobile) {
            client.activeDocument(null);
        }
    };

    client.goToDocument = function(document) {
        if (client.isMobile) {
            client.activeDocument(document);
        } else if (client.isTablet) {
            client.activeDocument(document);
        } else if (client.isDesktop) {
            client.openDocumentInOtherWindow(document);
        }
    };

    client.openDocumentInOtherWindow = function(document) {

        var w = window.open();
        var html = document.name;

        $(w.document.body).html(html);

    };

    client.goBack = function() {
        client.activeDocument(null);
    };

    // Conditional view
    // Do no use ko.computed when not needed
    client.shouldDisplayDocumentList = ko.computed(function() {
        return (!client.activeDocument()) || client.isTablet;
    });

    client.shouldDisplayFilterToolbar = ko.computed(function() {
        return (!client.activeDocument()) || client.isTablet;
    });

    client.shouldDisplayTabsNavbar = function() {
        return (client.activeDocument() === null) || client.isDesktop || client.isTablet;
    };

    client.shouldDisplayDocumentNavbar = function() {
        return client.activeDocument && !client.isDesktop;
    };

    // Show Timeline by default
    client.goToTab(timelineTab);

    if (client.isDesktop) {
        client.availableProviders = ko.observableArray([]);

        client.fetchAvailableProviders = function() {

            var url = "/app/providers";
            var data = "data=%7B%22sessionId%22%3A%22fake_session_id%22%2C%22salesFetchURL%22%3A%22https%3A%2F%2Fstaging-salesfetch.herokuapp.com%22%2C%22instanceURL%22%3A%22https%3A%2F%2Feu0.salesforce.com%22%2C%22context%22%3A%7B%22templatedDisplay%22%3A%22Matthieu%20Bacconnier%22%2C%22templatedQuery%22%3A%22Matthieu%20Bacconnier%22%2C%22recordId%22%3A%220032000001DoV22AAF%22%2C%22recordType%22%3A%22Contact%22%7D%2C%22user%22%3A%7B%22id%22%3A%2200520000003RnlGAAS%22%2C%22name%22%3A%22mehdi%40anyfetch.com%22%2C%22email%22%3A%22tanguy.helesbeux%40insa-lyon.fr%22%7D%2C%22organization%22%3A%7B%22id%22%3A%2200D20000000lJVPEA2%22%2C%22name%22%3A%22AnyFetch%22%7D%2C%22hash%22%3A%22gyLaoDYnXvI96n0TWU6t%2BXQl64Q%3D%22%7D";

            $.ajax({
                dataType: "json",
                url: url,
                data: data,
                success: function(data, textStatus, jqXHR) {
                    client.setAvailableProviders(data.providers);
                },
                error: function() {
                    console.log('Could not retrieve providers');
                }
            });
        };

        client.fetchAvailableProviders();
    }

    // Demo
    var demoDocuments = [
        {name: 'Contrat 12', type: 'document', provider: 'Dropbox', starred: false},
        {name: 'Oublie pas !', type: 'contact', provider: 'Evernote', starred: true},
        {name: 'Vacance 117.jpg', type: 'image', provider: 'Dropbox', starred: false},
        {name: 'Facture', type: 'salesforce', provider: 'Google Drive', starred: true},
        {name: 'FWD: #laMamanDeRicard', type: 'email', provider: 'Google Contacts', starred: false},

        {name: 'Contrat 12', type: 'document', provider: 'Dropbox', starred: false},
        {name: 'Oublie pas !', type: 'contact', provider: 'Evernote', starred: true},
        {name: 'Vacance 117.jpg', type: 'image', provider: 'Dropbox', starred: false},
        {name: 'Facture', type: 'salesforce', provider: 'Google Drive', starred: true},
        {name: 'FWD: #laMamanDeRicard', type: 'email', provider: 'Google Contacts', starred: false},
        {name: 'Contrat 12', type: 'document', provider: 'Dropbox', starred: false},
        {name: 'Oublie pas !', type: 'contact', provider: 'Evernote', starred: true},
        {name: 'Vacance 117.jpg', type: 'image', provider: 'Dropbox', starred: false},
        {name: 'Facture', type: 'salesforce', provider: 'Google Drive', starred: true},
        {name: 'FWD: #laMamanDeRicard', type: 'email', provider: 'Google Contacts', starred: false}
    ];
}

ko.applyBindings(new SalesfetchViewModel());
