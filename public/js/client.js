
var docTotalNumber = 0;
function Document(name, isStarred) {
    var self = this;
    self.name = name;
    self.isStarred = ko.observable(isStarred);
    self.id = docTotalNumber++;
    self.type = null;
    self.provider = null;

    self.toggleStarred = function() {
        this.isStarred(!this.isStarred());
    }
}

function Provider(name) {
    var self = this;
    self.name = name;
    self.isActive = ko.observable(true);

    self.toggleActive = function() {
        this.isActive(!this.isActive());
    }
}

function Type(name) {
    var self = this;
    self.name = name;
    self.isActive = ko.observable(true);

    self.toggleActive = function() {
        this.isActive(!this.isActive());
    }
}

var tabTotalNumer = 0;
function TabModel(name) {
    var self = this;
    self.name = name;
    self.id = tabTotalNumer++;
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

    // Return providers filtered isActive
    client.filteredProviders = ko.computed(function() {
        return client.providers().filter(function(provider) {
            return provider.isActive();
        });
    });

    // Return types filtered isActive
    client.filteredTypes = ko.computed(function() {
        return client.types().filter(function(type) {
            return type.isActive();
        });
    });

    // Return documents filtered by providers and types
    client.filteredDocuments = ko.computed(function() {
        return client.documents().filter(function(document) {
            return document.provider.isActive() && document.type.isActive();
        });
    });

    // Tabs
    var TimelineTab = new TabModel('Timeline', []);
    TimelineTab.documents = client.filteredDocuments;
    TimelineTab.pullRight = false;

    var StarredTab = new TabModel('Starred', []);
    StarredTab.documents = ko.computed(function() {
        return client.filteredDocuments().filter(function(document) {
            return (document.isStarred() === true);
        });
    });
    StarredTab.pullRight = false;

    var SearchTab = new TabModel('Search', []);
    SearchTab.documents = ko.computed(function() {
        return client.filteredDocuments().filter(function(document) {
            return (document.name.search('c') != -1);
        });
    });
    SearchTab.pullRight = true;

    client.tabs = [TimelineTab, StarredTab, SearchTab];

    // Add providers tab if desktop
    client.providerTab = client.isDesktop ? new TabModel('Providers', []) : null;

    client.activeTab = ko.observable();
    client.activeDocument = ko.observable();

    client.addDocument = function(json) {
        client.documents.push(client.DocumentWithJson(json));
    };

    client.addDocuments = function(array) {
        array.forEach(function(json) {
            client.addDocument(json);
        });
    }

    client.DocumentWithJson = function(json) {
        var document = new Document(json['name'], json['starred']);
        document.provider = client.ProviderWithName(json['provider']);
        document.type = client.TypeWithName(json['type']);
        return document;
    }

    client.ProviderWithName = function(providerName) {
        var provider = null;
        client.providers().some(function(providerIte) {
            if (providerIte.name === providerName) {
                provider = providerIte;
                return true;
            };
            return false;
        });

        if (!provider) {
            provider = new Provider(providerName);
            client.providers.push(provider);
        }

        return provider;
    }

    client.TypeWithName = function(typeName) {
        var type = null;
        client.types().some(function(typeIte) {
            if (typeIte.name === typeName) {
                type = typeIte;
                return true;
            };
            return false;
        });

        if (!type) {
            type = new Type(typeName);
            client.types.push(type);
        }

        return type;
    }

    // Behaviours
    client.goToTab = function(tab) {
        client.activeTab(tab);
        client.activeDocument(null);
    };

    client.goToDocument = function(document) {
        if (client.isMobile) {
            client.activeDocument(document);
        } else if (client.isTablet) {

        } else if (client.isDesktop) {
            window.open('','_blank');
        };
    };

    client.goBack = function() {
        client.activeDocument(null);
    }

    // Conditional view
    client.shouldDisplayTabsNavbar = function() {
        return (client.activeDocument() == null) || client.isDesktop;
    }

    client.shouldDisplayDocumentNavbar = function() {
        return client.activeDocument && !client.isDesktop;
    }

    // Show Timeline by default
    client.goToTab(TimelineTab);

    // Demo
    client.addDocuments([
        {name: 'Contrat 12', type: 'PDF', provider: 'Dropbox', starred: false},
        {name: 'Oublie pas !', type: 'Note', provider: 'Evernote', starred: true},
        {name: 'Vacance 117.jpg', type: 'Picture', provider: 'Dropbox', starred: false},
        {name: 'Facture', type: 'PDF', provider: 'Drive', starred: true},
        {name: 'FWD: #laMamanDeRicard', type: 'Mail', provider: 'Gmail', starred: false}
    ]);


};

ko.applyBindings(new SalesfetchViewModel());


