'use strict';

var getURLParameter = function(name) {
    var querystring = window.location.search.substring(1);
    var variables = querystring.split('&');
    for (var i = 0; i < variables.length; i+=1) {
        var param = variables[i].split('=');
        if (param[0] === name) {
            return param[1];
        }
    }
};

/**
 * @param {String} url
 * @param {String} [options] Additional options for the AJAX call
 * @param {Function} success
 * @param {Function} [error]
 */
var call = function(url, options, success, error) {
    var defaultError = function(res, status, err) {
        console.log('Error when communicating with the server:', err);
        if(res.responseJSON && res.responseJSON.message) {
            console.log(res.responseJSON.message);
        }
        else {
            console.log(res.responseText);
        }
    };

    // `options` and `errorMessage` can be omitted
    if(!error && success) {
        error = success;
        success = options;
        options = {};
    }
    else if(!error && !success) {
        success = options;
        options = {};
        error = defaultError;
    }

    url += '?data=' + getURLParameter('data');
    var params = {
        dataType: 'json',
        type: 'get',
        url: url,
        success: success,
        error: error
    };
    params = $.extend(params, options);

    $.ajax(params);
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
        var url = '/app/pins/' + self.id;

        // We can't use 'json' as data type,
        // otherwise empty responses (desired) get treated as an error
        var options = {
            dataType: 'text',
            type: (this.isStarred() ? 'delete' : 'post')
        };

        // We do not wait on request to display the new status
        // But we will reverse on error (i.e. ask forgiveness)
        var successState = !self.isStarred();
        self.isStarred(successState);

        call(url, options, null, function error(res) {
            self.isStarred(!successState);
            console.log('Could not star/unstar document ' + self.id);
            console.log(res.responseText);
        });
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
        self.description = json.description;
        self.developer = json.developer ? json.developer.name : 'unknown';
    }

    self.toggleActive = function() {
        this.isActive(!this.isActive());
    };

    self.connect = function () {
        var url = '/app/providers/' + self.id + '?data=' + getURLParameter('data');
        var options = {
            type: 'post'
        };

        call(url, options, function success(data) {
            window.open(data.url);
        });
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

    // Return providers filtered by isActive
    client.filteredProviders = ko.computed(function() {
        var activeProviders = client.connectedProviders().filter(function(provider) {
            return provider.isActive();
        });

        // Update client.filterByProvider
        client.filterByProvider(activeProviders.length !== 0);

        return client.filterByProvider() ? activeProviders : client.connectedProviders();
    });

    // Return types filtered by isActive
    client.filteredTypes = ko.computed(function() {
        var activeTypes = client.types().filter(function(type) {
            return type.isActive();
        });

        // Update client.filterByType
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
        // TODO: search with fuzzy matching
        return client.filteredDocuments();
        // return client.filteredDocuments().filter(function(document) {
        //     // return (document.name.search('c') !== -1);
        //     return true;
        // });
    });

    // Set default tabs
    client.tabs = [timelineTab, starredTab, searchTab];

    // Desktop has an additional `Providers` tab
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
    // Do no use ko.computed when not needed for performance reasons
    client.shouldDisplayDocumentList = ko.computed(function() {
        return (!client.activeDocument() && client.activeTab() !== client.providerTab) || client.isTablet;
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
            call('/app/providers', function success(data) {
                client.setAvailableProviders(data.providers);
            });
        };
        client.fetchAvailableProviders();
    }

    client.fetchDocuments = function() {
        call('/app/documents', function success(data) {
            client.addDocuments(data.documents.data);
        });
    };
    client.fetchDocuments();

    client.fetchFullDocument = function(document) {
        call('/app' + document.url, function success(data) {
            document.full(data.rendered.full);
        });
    };
}

ko.applyBindings(new SalesfetchViewModel());
