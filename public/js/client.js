
var docTotalNumber = 0;

function Document(name, isStarred) {
    var self = this;
    self.name = name;
    self.isStarred = ko.observable(isStarred);
    self.id = docTotalNumber++;
    self.type = null;
    self.provider = null;
}

function Provider(name) {
    var self = this;
    self.name = name;
    self.isActive = ko.observable(true);
}

function Type(name) {
    var self = this;
    self.name = name;
    self.isActive = ko.observable(true);
}

function TabModel(id, documents) {
    var self = this;
    self.id = id;
}

function SalesfetchViewModel() {

    var client = this;
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

    var StarredTab = new TabModel('Starred', []);
    StarredTab.documents = ko.computed(function() {
        return client.filteredDocuments().filter(function(document) {
            return (document.isStarred() === true);
        });
    });

    var SearchTab = new TabModel('Search', []);
    SearchTab.documents = ko.computed(function() {
        return client.filteredDocuments().filter(function(document) {
            return (document.name.search('c') != -1);
        });
    });

    client.leftTabs = [TimelineTab, StarredTab];
    client.rightTabs = [SearchTab];

    client.activeTab = ko.observable(TimelineTab);
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
        client.activeDocument(document);
    };

    client.goBack = function() {
        client.activeDocument(null);
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
