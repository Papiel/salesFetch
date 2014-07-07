
var docTotalNumber = 0;

function Document(name, type, provider, isStarred) {
    var self = this;
    self.name = name;
    self.provider = provider;
    self.isStarred = isStarred;
    self.id = docTotalNumber++;
    self.type = type;
}

function TabModel(id, documents) {
    var self = this;
    self.id = id;
    self.documents = ko.observableArray(documents);

    self.setDocuments = function(documents) {
        self.documents = ko.observableArray(documents);
        console.log(self.documents());
    };
}

function SalesfetchViewModel() {

    var client = this;
    var TimelineTab = new TabModel('Timeline', []);
    var StarredTab = new TabModel('Starred', []);
    client.leftTabs = [TimelineTab, StarredTab];

    client.rightTabs = [
        new TabModel('Search', [])
    ];
    client.chosenTabId = ko.observable();
    client.chosenTabData = ko.observable();
    client.chosenDocumentData = ko.observable();

    client.activeTab = ko.observable(TimelineTab);
    client.activeDocument = ko.observable();

    // Editable data
    client.documents = ko.observableArray([]);
    client.providers = ko.observableArray([]);
    client.types = ko.observableArray([]);

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

    client.getStarredDocuments = ko.computed(function() {
        return client.documents().filter(function(document) {
            return (document.isStarred === true);
        });
    })
    // Behaviours
    client.goToTab = function(tab) {
        // location.hash = tab
        client.activeTab(tab);
        client.chosenDocumentData(null);

        if (tab === 'Starred') {
            var starreDocs = client.getStarredDocuments();
            console.log(starreDocs);
            client.chosenTabData(starreDocs);
        } else {
            client.chosenTabData(client.documents());
        };
    };
    client.goToDocument = function(document) {
        client.activeDocument(document);
    };

    client.goBack = function() {
        client.goToTab(Timeline);
    }

    client.setDocuments = function(documents) {
        client.chosenTabData(documents);
    };


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

    TimelineTab.setDocuments(client.documents());
};

ko.applyBindings(new SalesfetchViewModel());
