'use strict';

var getURLParameter = function(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i+=1)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam)
        {
            return sParameterName[1];
        }
    }
};

function Document(json) {
    var self = this;
    self.isStarred = ko.observable(json.pinned);
    self.id = json.id;
    self.snippet = json.rendered.snippet;
    self.title = json.rendered.title;
    self.url = json.document_url;

    self.type = null;
    self.provider = null;
    self.full = ko.observable();

    self.toggleStarred = function() {
        this.isStarred(!this.isStarred());
    };
}

function Provider(json) {
    var self = this;
    self.isActive = ko.observable(false);

    if (json) {
        self.name = json.name;
        self.id = json.id;
        self.redirect_uri = json.redirect_uri;
        self.trusted = json.trusted;
        self.featured = json.featured;
    }

    self.toggleActive = function() {
        this.isActive(!this.isActive());
    };
}

function Type(json) {
    var self = this;
    self.isActive = ko.observable(false);

    if (json) {
        self.name = json.name;
    }

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
    client.availableProviders = ko.observableArray([]);

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
            // return (document.name.search('c') !== -1);
            // TODO search
            return true;
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
        var document = new Document(json);
        document.provider = client.ProviderWithJson(json.provider);
        document.type = client.TypeWithJson(json.document_type);
        return document;
    };

    client.setAvailableProviders = function(json) {
        var availableProviders = [];
        json.forEach(function(providerInfo) {
            availableProviders.push(new Provider(providerInfo));
        });
        client.availableProviders(availableProviders);
    };

    client.setConnectedProvider = function(json) {
        var connectedProviders = [];
        json.forEach(function(providerInfo) {
            connectedProviders.push(new Provider(providerInfo));
        });
        client.connectedProviders(connectedProviders);
    };

    client.ProviderWithJson = function(json) {
        var provider = null;
        client.connectedProviders().some(function(providerIte) {
            if (providerIte.client === json.client) {
                provider = providerIte;
                return true;
            }
            return false;
        });

        if (!provider) {
            provider = new Provider(json);
            client.connectedProviders.push(provider);
        }

        return provider;
    };

    client.TypeWithJson = function(json) {
        var type = null;
        client.types().some(function(typeIte) {
            if (typeIte.name === json.name) {
                type = typeIte;
                return true;
            }
            return false;
        });

        if (!type) {
            type = new Type(json);
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
        client.fetchFullDocument(document);

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
        var html = document.snippet;

        $(w.document.body).html(html);

    };

    client.goBack = function() {
        scrollToTop();
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
        client.fetchAvailableProviders = function() {
            var url = '/app/providers';
            var data = 'data=' + getURLParameter('data');

            $.ajax({
                dataType: 'json',
                url: url,
                data: data,
                success: function(data) {
                    client.setAvailableProviders(data.providers);
                },
                error: function() {
                    console.log('Could not retrieve providers');
                }
            });
        };
        client.fetchAvailableProviders();
    }

    client.fetchDocuments = function() {
        var url = '/app/documents';
        var data = 'data=' + getURLParameter('data');

        $.ajax({
            dataType: 'json',
            url: url,
            data: data,
            success: function(data) {
                client.addDocuments(data.documents.data);
            },
            error: function() {
                console.log('Could not retrieve providers');
            }
        });
    };
    client.fetchDocuments();

    client.fetchFullDocument = function(document) {
        var url = '/app' + document.url;
        var data = 'data=' + getURLParameter('data');

        $.ajax({
            dataType: 'json',
            url: url,
            data: data,
            success: function(data) {
                document.full(data.rendered.full);
            },
            error: function() {
                console.log('Could not retrieve full document');
            }
        });
    };
}

ko.applyBindings(new SalesfetchViewModel());
