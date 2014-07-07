function salesfetchViewModel() {

    var client = this;
    client.leftTabs = ['Timeline', 'Stared'];
    client.rightTabs = ['Search'];
    client.chosenTabId = ko.observable();
    client.chosenTabData = ko.observable();
    client.chosenDocumentData = ko.observable();

    // Behaviours
    client.goToTab = function(tab) { location.hash = tab };
    client.goToDocument = function(document) { location.hash = document.tab + '/' + document.id };

    // Client-side routes
    Sammy(function() {
        this.get('#:tab', function() {
            client.chosenTabId(this.params.tab);
            client.chosenDocumentData(null);
            client.chosenTabData({id: "Timeline", documents: [{id: 1, name: "Dopbox", tab: 'Timeline'}, {id: 2, name: "Mail", tab: 'Stared'}]});
        });

        this.get('#:tab/:documentId', function() {
            client.chosenTabId(this.params.tab);
            client.chosenTabData(null);
            client.chosenDocumentData({id:'Stared', name: 'myDocument'});
            // $.get("./document", { documentId: this.params.documentId }, client.chosenDocumentData);
        });

    }).run();
};

ko.applyBindings(new salesfetchViewModel());
