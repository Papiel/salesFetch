
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

function Provider(name) {
    var self = this;
    self.name = name;
    self.isActive = ko.observable(false);

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
    client.providers = ko.observableArray([]);
    client.types = ko.observableArray([]);

    client.filterByProvider = ko.observable(false);
    client.filterByType = ko.observable(false);

    // Return providers filtered isActive
    client.filteredProviders = ko.computed(function() {
        var activeProviders = client.providers().filter(function(provider) {
            return provider.isActive();
        });

        //update client.filterByProvider
        client.filterByProvider(activeProviders.length != 0);

        return client.filterByProvider() ? activeProviders : client.providers();
    });

    // Return types filtered isActive
    client.filteredTypes = ko.computed(function() {
        var activeTypes = client.types().filter(function(type) {
            return type.isActive();
        });

        //update client.filterByType
        client.filterByType(activeTypes.length != 0);

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
        client.providerTab.availableProviders = ko.computed(function() {
            return client.providers();
        });
        client.providerTab.connectedProviders = ko.computed(function() {
            return client.providers();
        });

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

    client.ProviderWithName = function(providerName) {
        var provider = null;
        client.providers().some(function(providerIte) {
            if (providerIte.name === providerName) {
                provider = providerIte;
                return true;
            }
            return false;
        });

        if (!provider) {
            provider = new Provider(providerName);
            client.providers.push(provider);
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
        };
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

    }

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

    // Demo
    client.addDocuments([
        {name: 'Contrat 12', type: 'document', provider: 'Dropbox', starred: false},
        {name: 'Oublie pas !', type: 'contact', provider: 'Evernote', starred: true},
        {name: 'Vacance 117.jpg', type: 'image', provider: 'Dropbox', starred: false},
        {name: 'Facture', type: 'salesforce', provider: 'Drive', starred: true},
        {name: 'FWD: #laMamanDeRicard', type: 'email', provider: 'Gmail', starred: false},

        {name: 'Contrat 12', type: 'document', provider: 'Dropbox', starred: false},
        {name: 'Oublie pas !', type: 'contact', provider: 'Evernote', starred: true},
        {name: 'Vacance 117.jpg', type: 'image', provider: 'Dropbox', starred: false},
        {name: 'Facture', type: 'salesforce', provider: 'Drive', starred: true},
        {name: 'FWD: #laMamanDeRicard', type: 'email', provider: 'Gmail', starred: false},
        {name: 'Contrat 12', type: 'document', provider: 'Dropbox', starred: false},
        {name: 'Oublie pas !', type: 'contact', provider: 'Evernote', starred: true},
        {name: 'Vacance 117.jpg', type: 'image', provider: 'Dropbox', starred: false},
        {name: 'Facture', type: 'salesforce', provider: 'Drive', starred: true},
        {name: 'FWD: #laMamanDeRicard', type: 'email', provider: 'Gmail', starred: false}
    ]);


}

ko.applyBindings(new SalesfetchViewModel());


