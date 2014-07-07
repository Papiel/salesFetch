
var docTotalNumber = 0;

function Document(name, type, provider, isStarred) {
    var self = this;
    self.name = name;
    self.provider = provider;
    self.isStarred = isStarred;
    self.id = docTotalNumber++;
    self.type = type;
}

function SalesfetchViewModel() {

    var client = this;
    client.leftTabs = ['Timeline', 'Stared'];
    client.rightTabs = ['Search'];
    client.chosenTabId = ko.observable();
    client.chosenTabData = ko.observable();
    client.chosenDocumentData = ko.observable();

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
    // Behaviours
    client.goToTab = function(tab) {
        // location.hash = tab
        client.chosenTabId(tab);
        client.chosenDocumentData(null);
        client.chosenTabData(client.documents());
    };
    client.goToDocument = function(document) {
        // location.hash = document.tab + '/' + document.id
        client.chosenTabData(null);
        client.chosenDocumentData(document);
    };

    client.goBack = function() {
        client.goToTab('Timeline');
    }

    client.setDocuments = function(documents) {
        client.chosenTabData(documents);
    };


    // Show Timeline by default
    client.goToTab('Timeline');



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
