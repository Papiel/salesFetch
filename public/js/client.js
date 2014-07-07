
var docTotalNumber = 0;

function Document(name, provider, isStarred) {
    var self = this;
    self.name = name;
    self.provider = provider;
    self.isStarred = isStarred;
    self.id = docTotalNumber++;
}

function SalesfetchViewModel() {

    var client = this;
    client.leftTabs = ['Timeline', 'Stared'];
    client.rightTabs = ['Search'];
    client.chosenTabId = ko.observable();
    client.chosenTabData = ko.observable();
    client.chosenDocumentData = ko.observable();

    // Editable data
    client.documents = ko.observableArray([
        new Document("PDF", "Dropbox", false),
        new Document("Note", "Evernote", true),
        new Document("Picture", "Dropbox", false),
        new Document("Spreadsheet", "Drive", true),
        new Document("Mail", "Gmail", false)
    ]);

    // Behaviours
    client.goToTab = function(tab) {
        // location.hash = tab
        client.chosenTabId(tab);
        client.chosenDocumentData(null);
        client.chosenTabData(client.documents());
        console.log(client.chosenTabData());
    };
    client.goToDocument = function(document) {
        // location.hash = document.tab + '/' + document.id
        client.chosenTabData(null);
        client.chosenDocumentData(document);
    };

    client.goBack = function() {
        console.log('coucou');
        client.goToTab('Timeline');
    }

    client.setDocuments = function(documents) {
        client.chosenTabData(documents);
    };


    // Show Timeline by default
    client.goToTab('Timeline');
};

ko.applyBindings(new SalesfetchViewModel());
