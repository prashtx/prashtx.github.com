/*jslint browser: true global document: true */

// Main ViewModel for the page.
var PageVM = function() {
  var self = {};

  // Hashtags
  self.tags = ko.observableArray();

  // Repos
  self.repos = ko.observableArray();

  self.refresh = function() {
    hashtub.getRepos({user: 'prashtx'}, function(result) {
      var tagTable;
      var tags = [];
      var repos = result.sort(function compare(a, b) {
        var x = a.updated_at;
        var y = b.updated_at;
        if (x < y) {
          return 1;
        } else if (x > y) {
          return -1;
        }
        return 0;
      });

      // Repos
      self.repos(repos);

      // Hashtags
      tagTable = hashtub.makeTagTable(repos);
      for (tag in tagTable) {
        if (tagTable.hasOwnProperty(tag)) {
          tags.push({ name: tag, repos: tagTable[tag] });
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
