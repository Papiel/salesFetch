
var docTotalNumber = 0;

function Document(name, type, provider, isStarred) {
    var self = this;
    self.name = name;
    self.provider = provider;
    self.isStarred = ko.observable(isStarred);
    self.id = docTotalNumber++;
    self.type = type;
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

    // Tabs
    var TimelineTab = new TabModel('Timeline', []);
    TimelineTab.documents = ko.computed(function() {
        return client.documents();
    });

    var StarredTab = new TabModel('Starred', []);
    StarredTab.documents = ko.computed(function() {
        return client.documents().filter(function(document) {
            return (document.isStarred() === true);
        });
    });

    var SearchTab = new TabModel('Search', []);
    SearchTab.documents = ko.computed(function() {
        return client.documents().filter(function(document) {
            return (document.name.search('c') != -1);
        });
    });

    client.leftTabs = [TimelineTab, StarredTab];
    client.rightTabs = [SearchTab];

    client.activeTab = ko.observable(TimelineTab);
    client.activeDocument = ko.observable();

    client.addDocument = function(document) {
        client.documents.push(document);
        client.providers.push(document.provider);
        client.types.push(document.type);
    };

    client.addDocuments = function(documents) {
        documents.forEach(function(document) {
            client.addDocument(document);
        });
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
        new Document("Contrat 12", "PDF", "Dropbox", false),
        new Document("Oublie pas !", "Note", "Evernote", true),
        new Document("Vacance 117.jpg", "Picture", "Dropbox", false),
        new Document("Facture", "PDF", "Drive", true),
        new Document("FWD: #laMamanDeRicard", "Mail", "Gmail", false)
    ]);


};

ko.applyBindings(new SalesfetchViewModel());
