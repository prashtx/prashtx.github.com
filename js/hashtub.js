/*jslint browser: true global document: true */
var hashtub = (function () {
  "use strict";
  var self = {};

  // Find and return the hash tags in a description string.
  function findTags(desc) {
    var re = /#[^# ]*/g;
    var matches;
    var i;
    var match;
    var tags = [];

    // No description.
    if (desc == null) {
      return tags;
    }

    matches = desc.match(re);

    // No tags.
    if (matches === null) {
      return tags;
    }

    // Remove the hash mark.
    for (i = 0; i < matches.length; i++) {
      match = matches[i];
      if (match.length !== 0) {
        tags.push(match.substring(1));
      }
    }

    return tags;
  }

  self.getRepos = function(options, cb) {
    var url;

    if (options.org != undefined) {
      url = 'https://api.github.com/orgs/' + options.org + '/repos';
    } else if (options.user != undefined) {
      url = 'https://api.github.com/users/' + options.user + '/repos';
    }

    if (url === undefined) {
      cb({});
      return;
    }

    $.ajax({url: url})
    .done(function (data) {
      cb(data);
    });
  }

  self.makeTagTable = function(repos) {
    var tagTable = {};
    var i;
    var j;
    var tags;
    var repoList;

    for (i = 0; i < repos.length; i ++) {
      tags = findTags(repos[i].description);
      for (j = 0; j < tags.length; j ++) {
        repoList = tagTable[tags[j]];

        // See if this tag is already in the table.
        if (tagTable[tags[j]] === undefined) {
          repoList = [];
          tagTable[tags[j]] = repoList;
        }

        // Add the repo under this tag entry.
        repoList.push(repos[i]);
      }
    }

    return tagTable;
  }

  return self;
})();
