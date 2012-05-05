/*jslint browser: true global document: true */

// Main ViewModel for the page.
var PageVM = function() {
  var self = {};

  // Hashtags
  self.tags = ko.observableArray();

  // List of surveys
  self.surveys = ko.observableArray();

  self.refresh = function() {
    //hashtub.getTagTable({org: 'codeforamerica'}, function(result) {
    hashtub.getTagTable({user: 'prashtx'}, function(result) {
      var tags = [];
      var tag;
      for (tag in result) {
        if (result.hasOwnProperty(tag)) {
          tags.push({ name: tag, repos: result[tag] });
        }
      }
      self.tags(tags);
    });
  };

  self.goToRepo = function(item) {
    window.location = item.html_url;
  };

  // Init
  self.refresh();

  return self;
};

$(document).ready(function() {
  ko.applyBindings(Object.create(PageVM()));
});
