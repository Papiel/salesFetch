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

var sliceInTime = function(documents) {
  var timeSlices = [{
    label: 'Today',
    maxDate: moment().startOf('day'),
    documents: []
  }, {
    label: 'Yesterday',
    maxDate: moment().startOf('day').subtract('day', 1),
    documents: []
  }, {
    label: 'Earlier this Week',
    maxDate: moment().startOf('week'),
    documents: []
  }, {
    label: 'Lasts Week',
    maxDate: moment().startOf('week').subtract('week', 1),
    documents: []
  }, {
    label: 'Earlier this Month',
    maxDate: moment().startOf('month'),
    documents: []
  }, {
    label: 'Last Month',
    maxDate: moment().startOf('month').subtract('month', 1),
    documents: []
  }, {
    label: 'Earlier this Year',
    maxDate: moment().startOf('year'),
    documents: []
  }, {
    label: 'Last Year',
    maxDate: moment().startOf('year').subtract('year', 1),
    documents: []
  }, {
    label: 'Older',
    documents: []
  }];

  documents.forEach(function(doc) {
    var creationDate = moment(doc.creation_date);
    var found = false;
    for (var i = 0; i < timeSlices.length && !found; i+=1) {
      if (i === 0 && creationDate.isAfter(timeSlices[i].maxDate)) {
        found = true;
        timeSlices[i].documents.push(doc);
      }

      if(!found && (!timeSlices[i].maxDate || creationDate.isAfter(timeSlices[i].maxDate))) {
        found = true;
        timeSlices[i].documents.push(doc);
      }
    }
  });
  return timeSlices;
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
    error = error || defaultError;
    if(!success) {
        success = options;
        options = {};
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
    self.creation_date = json.creation_date;

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
        var noop = function() {};

        // We do not wait on request to display the new status
        // But we will reverse on error (i.e. ask forgiveness)
        var successState = !self.isStarred();
        self.isStarred(successState);

        call(url, options, noop, function error(res) {
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
        self.name = json.name ? json.name : json.client.name;
        self.id = json.id;
        self.redirect_uri = json.redirect_uri;
        self.trusted = json.trusted;
        self.featured = json.featured;
        self.description = json.description;
        self.developer = json.developer ? json.developer.name : 'unknown';
        self.accountName = json.account_name ? json.account_name : 'unknown';
        self.count = json.document_count;
    }

    self.toggleActive = function() {
        this.isActive(!this.isActive());
    };

    self.connect = function () {
        var url = '/app/providers/' + self.id ;
        var options = {
            type: 'post'
        };

        call(url, options, function success(data) {
            window.open(data.url, '','width=700, height=700');
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

    self.imageURL = function() {
        return 'img/document_types-icons/' + self.name + '.png';
    };
}

var tabTotalNumer = 0;
function TabModel(name, display, pullRight, client) {
    var self = this;
    self.name = name;
    self.display = display;
    self.id = tabTotalNumer;
    tabTotalNumer += 1;
    self.pullRight = pullRight;
    self.filter = null;

    self.timeSlices = ko.computed(function() {
        var docs = self.filter ? client.documents().filter(self.filter) : client.documents();
        return sliceInTime(docs);
    });
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

    client.documentListError = ko.observable();
    client.documentViewerError = ko.observable();

    if (client.isTablet) {
        client.shouldDisplayDocumentViewerDefaultMessage = ko.observable(true);
    }

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
    var providerAndTypeFilter = function(document) {
        var providerFilter = document.provider.isActive() || !client.filterByProvider();
        var typeFilter = document.type.isActive() || !client.filterByType();
        return providerFilter && typeFilter;
    };

    var starredFilter = function(document) {
        return (document.isStarred() === true) && providerAndTypeFilter(document);
    };

    // Tabs
    var timelineTab = new TabModel('Timeline', 'fa-list', false, client);
    timelineTab.filter = providerAndTypeFilter;

    var starredTab = new TabModel('Starred', 'fa-star-o', false, client);
    starredTab.filter = starredFilter;

    var searchTab = new TabModel('Search', 'fa-search', true, client);

    // Set default tabs
    client.tabs = [timelineTab, starredTab, searchTab];

    // Desktop has an additional `Providers` tab
    if (client.isDesktop) {
        client.providerTab = new TabModel('Providers', 'fa-link', false, client);
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
            // This IF prevents fetching the anonymous token
            if (!providerInfo._type === "AccessToken" || providerInfo.client) {
                connectedProviders.push(new Provider(providerInfo));
            }
        });
        client.connectedProviders(connectedProviders);
    };

    client.ProviderWithJson = function(json) {
        var provider = null;
        client.connectedProviders().some(function(providerIte) {
            if (providerIte.id === json.id) {
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
        if (!document.full()) {
            client.fetchFullDocument(document);
        }

        if (client.shouldDisplayDocumentViewerDefaultMessage) {
            client.shouldDisplayDocumentViewerDefaultMessage(false);
        }

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

    client.setIframeContent = ko.computed(function() {
        var iframe = $('#full-iframe')[0];
        iframe.contentDocument.close();
        iframe.contentDocument.write('');

        if (client.activeDocument() && client.activeDocument().full()) {
            iframe.contentDocument.write(client.activeDocument().full());
        }
    });

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

    client.shouldDisplayDocumentsSpinner = ko.observable(false);
    client.shouldDisplayViewerSpinner = ko.observable(false);

    // Show Timeline by default
    client.goToTab(timelineTab);

    if (client.isDesktop) {
        client.fetchAvailableProviders = function() {
            call('/app/providers', function success(data) {
                client.setAvailableProviders(data.providers);
                client.setConnectedProvider(data.connectedProviders);
            });
        };
        client.fetchAvailableProviders();

        window.refreshProviders = function() {
            client.fetchAvailableProviders();
        };
    }

    client.fetchDocuments = function() {
        client.shouldDisplayDocumentsSpinner(true);
        call('/app/documents', {}, function success(data) {
            client.addDocuments(data.documents.data);
            client.shouldDisplayDocumentsSpinner(false);
        }, function error() {
            client.shouldDisplayDocumentsSpinner(false);
            client.documentListError('Failed to reach the server');
        });
    };
    client.fetchDocuments();

    client.fetchFullDocument = function(document) {
        client.shouldDisplayViewerSpinner(true);
        call('/app' + document.url, {}, function success(data) {
            document.full(data.rendered.full);
            client.shouldDisplayViewerSpinner(false);
        }, function error() {
            client.shouldDisplayViewerSpinner(false);
            client.documentViewerError('Failed to reach the server');
        });
    };
}

ko.applyBindings(new SalesfetchViewModel());
