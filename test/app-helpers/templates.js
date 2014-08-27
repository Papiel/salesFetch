'use strict';

var should = require('should');

var templates = require('../../app/helpers/templates.js');

describe('<Helper functions>', function() {

  describe('Templating', function() {
    var documentType = 'testDocumentTypeId';
    var doc = {
      id: "5320a773bc2e51d7135f0c8f",
      document_type: {
        id: documentType,
        name: "testDocumentType",
        templates: {
          snippet: "This is the default 'snippet' template",
          full: "This is the default 'full' template",
          title: "This is the default 'title' template"
        },
      },
      data: {
        title: "My dummy document",
        snippet: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      }
    };

    it('should use overrided template if available', function() {
      var rendered = templates.render(doc, 'test', documentType);
      should(rendered).be.ok;
      rendered.should.match(/the overrided template has been used/i);
    });

    it('should fallback to provided template', function() {
      var rendered = templates.render(doc, 'title', 'not_overrided_document_type_id');
      should(rendered).be.ok;
      rendered.should.equal(doc.document_type.templates.title);
    });

    it('should infer document type id if ommitted', function() {
      var rendered1 = templates.render(doc, 'full', documentType);
      var rendered2 = templates.render(doc, 'full');
      should(rendered1).be.ok;
      should(rendered2).be.ok;
      rendered2.should.equal(rendered1);
    });

    it('should fallback to default template on last resort', function() {
      var rendered = templates.render(doc, 'unicorn');
      should(rendered).be.ok;
      rendered.should.containDeep(doc.data.title);
    });
  });

});
