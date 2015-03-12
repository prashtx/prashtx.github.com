(function ($, _) {
  'use strict';
  $(function () {

    function sec(x) { return 1 / Math.cos(x); }

    function coordsToTiles(zoom, coords) {
      var n = Math.pow(2, zoom);
      var lon_rad = coords[0] * Math.PI / 180;
      var lat_rad = coords[1] * Math.PI / 180;
      var xtile = n * (1 + (lon_rad / Math.PI)) / 2;
      var ytile = n * (1 - (Math.log(Math.tan(lat_rad) + sec(lat_rad)) / Math.PI)) / 2;
      return [Math.floor(xtile), Math.floor(ytile)];
    }

    function tile2long(x,z) {
      return (x/Math.pow(2,z)*360-180);
    }

    function tile2lat(y,z) {
      var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
      return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
    }

    function getTileCoords(zoom, bbox) {
      var tileBBox = [coordsToTiles(zoom, bbox[0]), coordsToTiles(zoom, bbox[1])];
      var tileCoords = [];
      var xrange;
      var yrange;

      if (tileBBox[0][0] <= tileBBox[1][0]) {
        xrange = _.range(tileBBox[0][0], tileBBox[1][0] + 1);
      } else {
        xrange = _.range(tileBBox[0][0], tileBBox[1][0] + 1, -1);
      }

      if (tileBBox[0][1] <= tileBBox[1][1]) {
        yrange = _.range(tileBBox[0][1], tileBBox[1][1] + 1);
      } else {
        yrange = _.range(tileBBox[0][1], tileBBox[1][1] - 1, -1);
      }

      _.each(xrange, function (x) {
        _.each(yrange, function (y) {
          tileCoords.push([zoom, x, y]);
        });
      });

      return tileCoords;
    }

    function tileToBBox(tileZXY) {
      var sw = [tile2long(tileZXY[1], tileZXY[0]), tile2lat(tileZXY[2] + 1, tileZXY[0])];
      var ne = [tile2long(tileZXY[1] + 1, tileZXY[0]), tile2lat(tileZXY[2], tileZXY[0])];
      return [sw, ne];
    }

    var $tile = $('#tile');
    $('form').submit(function (e) {
      e.preventDefault();
      var tile = $tile.val();
      if (tile.length === 0) {
        tile = $tile.attr('placeholder');
      }
      var bbox = tileToBBox(tile.split('/').map(function (n) {
        return parseInt(n, 10);
      }));

      var west = bbox[0][0];
      var south = bbox[0][1];
      var east = bbox[1][0];
      var north = bbox[1][1];

      $('#xmin').html(west);
      $('#ymin').html(south);
      $('#xmax').html(east);
      $('#ymax').html(north);
      $('#bbox').html(_.escape(JSON.stringify(bbox)));

      var boundingCoordinates = [ [ [west, south], [west, north], [east, north], [east, south], [west, south] ] ];
      var poly = {
        type: 'Polygon',
        coordinates: boundingCoordinates
      };
      $('#poly').html(_.escape(JSON.stringify(poly, null, 2)));
      var url = 'http://geojson.io/#data=data:application/json,' + encodeURIComponent(JSON.stringify(poly));
      $('#geojsonio').attr('href', url).html('Map on geojson.io');
      $('#results').attr('hidden', false);
    });
  });
}(window.jQuery, window._));
