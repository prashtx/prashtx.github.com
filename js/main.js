/*jslint browser: true global document: true */

// Main ViewModel for the page.
var PageVM = function() {
  var self = {};

  // Hashtags
  self.tags = ko.observableArray();

  // Repos
  self.repos = ko.observableArray();

  self.refresh = function() {
    // Repos.
    url = 'https://api.github.com/users/prashtx/repos';
    $.ajax({url: url})
    .done(function(result) {
      self.repos(result);
    });

    // Hashtags.
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
