'use strict';

var call = require('./helpers/call.js');
var scrollToTop = require('./misc.js').scrollToTop;

var Document = require('./models/Document.js');
var Provider = require('./models/Provider.js');
var Type = require('./models/Type.js');
var TabModel = require('./models/TabModel.js');

function SalesfetchViewModel() {
    var client = this;

    // ----- Client device detection
    client.isMobile = device.mobile();
    client.isTablet = device.tablet();
    client.isDesktop = device.desktop();

    // ----- Editable data
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

    // ----- Tabs
    var timelineTab = new TabModel('Timeline', 'fa-list', false, client);
    timelineTab.filter = providerAndTypeFilter;

    var starredTab = new TabModel('Starred', 'fa-star-o', false, client);
    starredTab.filter = starredFilter;

    // TODO: re-enable when feature exists
    //var searchTab = new TabModel('Search', 'fa-search', true, client);

    // Set default tabs
    client.tabs = [timelineTab, starredTab]; // searchTab

    // Desktop has an additional 'Providers' tab
    if (client.isDesktop) {
        client.providerTab = new TabModel('Providers', 'fa-link', false, client);
        client.tabs.push(client.providerTab);
    }

    client.activeTab = ko.observable();
    client.activeDocument = ko.observable();

    // ----- Model management

    client.addDocument = function(json) {
        client.documents.push(client.DocumentWithJson(json));
    };

    client.addDocuments = function(array) {
        if (array && array.length > 0) {
            array.forEach(function(json) {
                client.addDocument(json);
            });
        }
        if (client.documents().length <= 0) {
            client.documentListError('No documents found for this query');
        }
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
            if (providerInfo._type !== "AccessToken" || providerInfo.client) {
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

    // ----- Navigation
    client.goToTab = function(tab) {
        client.activeTab(tab);

        if (client.isMobile) {
            client.activeDocument(null);
        }
    };

    client.goToDocument = function(doc) {
        if(client.activeDocument() !== doc) {
            if(client.shouldDisplayDocumentViewerDefaultMessage) {
                client.shouldDisplayDocumentViewerDefaultMessage(false);
            }
            client.activeDocument(doc);

            var cssBlock = document.createElement('style');
            cssBlock.type = 'text/css';
            cssBlock.innerHTML = 'body { padding: 20px } header { font-size: 25px; margin-bottom: 30px; } #spinner {width: 44px; height: 44px; position: absolute; margin: auto; top: 0; bottom: 0; right: 0; left: 0;}';
            var target;
            if(!client.isDesktop) {
                // TODO: check for browser compatibility
                var iframe = $('#full-iframe')[0];
                target = iframe.contentDocument;
                frames['full-iframe'].document.head.appendChild(cssBlock);
            }
            else {
                // We need to open the popup window right now (i.e. during event handling)
                // otherwise we'll get blocked
                var w = window.open(null, '_blank');
                target = w.document;
                target.head.appendChild(cssBlock);

                // TODO: do not hardcode!
                var domainPath = 'https://localhost:3000';
                var fontAwesomeLink = '<link rel="stylesheet" type="text/css" href="'+domainPath+'/lib/fontawesome/css/font-awesome.min.css">';
                var spinnerHTML = '<i id="spinner" class="fa fa-spin fa-fw fa-refresh fa-3x"></i>';

                $(target.body).html(fontAwesomeLink + spinnerHTML);
            }

            var writeFullView = function(html) {
                $(target.body).html(html);
            };

            // Load document full document content (AJAX) if needed
            // and write the result in the viewer
            if(!doc.full()) {
                client.fetchFullDocument(doc, writeFullView);
            }
            else {
                writeFullView(doc.full());
            }
        }
    };

    // Each time the content of the curerent document's full view changes
    // reset the content of the viewer
    if(!client.isDesktop) {
        client.resetFullDocumentView = ko.computed(function() {
            // The following is only useful to let Knockout know
            // that we're dependent on the value of `activeDocument` and `activeDocument().full`
            if(client.activeDocument()) {
                client.activeDocument().full();
            }

            var iframe = $('#full-iframe')[0];
            iframe.contentDocument.close();
            iframe.contentDocument.write('<html><head></head><body></body></html>');
        });
    }

    client.goBack = function() {
        scrollToTop();
        client.activeDocument(null);
    };

    // ----- Conditional views
    // Do no use ko.computed when not needed for performance reasons
    client.shouldDisplayDocumentList = ko.computed(function() {
        return (client.activeTab() !== client.providerTab) && (!client.activeDocument() || !client.isMobile);
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

    // ----- Requests to the backend
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
        }, function error(res) {
            client.shouldDisplayDocumentsSpinner(false);
            client.documentListError(getErrorMessage(res));
        });
    };
    client.fetchDocuments();

    client.fetchFullDocument = function(document, cb) {
        client.shouldDisplayViewerSpinner(true);

        call('/app' + document.url, {}, function success(data) {
                client.shouldDisplayViewerSpinner(false);
                document.title(data.rendered.title);
                document.full(data.rendered.full);
                cb(data.rendered.full);
            }, function error(res) {
                client.shouldDisplayViewerSpinner(false);
                client.documentViewerError(getErrorMessage(res));
            }
        );
    };

    // ----- Error messages
    /**
      * Regexp => Error string
      * Regexp should be ordered from most precise to more generic
      */
    // TODO: internationalize
    var errorMessages = {
        'unprocessable entity': 'Missing aunthentication information',
        'template parameter is missing': 'Missing parameters: check your VisualForce page configuration (`templatedQuery` or `templatedDisplay`)',
        'salesfetch master key': 'Unable to authenticate your request, please check your SalesFetch master key',
        'no documents': 'No documents found for this query'
    };
    var getErrorMessage = function(res) {
        var err = (res.responseJSON ? res.responseJSON.code + ': ' + res.responseJSON.message : res.responseText);

        for(var expression in errorMessages) {
            if(err.match(new RegExp(expression, 'gi'))) {
                return errorMessages[expression];
            }
        }

        return err || 'Failed to reach the server';
    };
}

ko.applyBindings(new SalesfetchViewModel());
