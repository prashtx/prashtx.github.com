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
      var i;
      var repo;
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
      for (i = 0; i < repos.length; i++) {
        repo = repos[i];
        repo.fork_parent = null;
        if (repo.fork == true) {
          // Use an observable, so we can update as the data arrives.
          repo = ko.observable(repo);
          repos[i] = repo;
          // Get repo information
          (function getRepoInfo(repoVM) {
            var repo = repoVM();
            $.ajax({url: repo.url})
              .done(function(data) {
                // Add parent repo information
                repo.fork_parent = {
                  name: data.parent.name,
                  user: data.parent.owner.login,
                  html_url: data.parent.html_url
                };
                repoVM(repo);
              });
          })(repo);
        }
      }
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
