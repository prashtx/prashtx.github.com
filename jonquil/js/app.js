(function ($, _) {
  'use strict';
  $(function () {
    var $url = $('#url');
    var $filter = $('#filter');
    var $flags = $('#flags');
    var $contentType = $('#content-type');
    var $output = $('#output');
    $('form').submit(function (e) {
      var url = $url.val();
      if (url.length === 0) {
        url = $url.attr('placeholder');
      }
      var filter = $filter.val();
      if (filter.length === 0) {
        filter = $filter.attr('placeholder');
      }
      var contentType = $contentType.val();
      if (contentType.length === 0) {
        contentType = $contentType.attr('placeholder');
      }
      // Parse flags
      var flags = $flags.val().split(' ');
      flags = _.map(flags, function (flag) {
        var f = _.trim(flag);
        if (_.startsWith(f, '--')) {
          f = f.substr(2);
        } else if (_.startsWith(f, '-')) {
          f = f.substr(1);
        }
        return f;
      }).join(',');
      e.preventDefault();
      var baseUrl = 'https://jonquil.herokuapp.com/jq';
      var computedUrl = baseUrl + '?' + $.param({
        url: url,
        f: filter,
        flags: flags
      });
      $.ajax({
        url: computedUrl,
        dataType: 'text'
      }).then(function (data) {
        $('#jq-url').html(_.escape(computedUrl));
        $output.html(_.escape(data));
      }).fail(function () {
        // TODO: report error
      });
    });
  });
}(window.jQuery, window._));
