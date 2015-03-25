function hsl2rgb(hsl) {
  var c = hsl[1] * (1 - Math.abs(2*hsl[2] - 1));
  var hp = hsl[0] / 60;
  var x = c * (1 - Math.abs((hp % 2) - 1));

  var rgbp;
  if (hp >= 0 && hp < 1) {
    rgbp = [c,x,0];
  } else if (hp >= 1 && hp < 2) {
    rgbp = [x,c,0];
  } else if (hp >= 2 && hp < 3) {
    rgbp = [0,c,x];
  } else if (hp >= 3 && hp < 4) {
    rgbp = [0,x,c];
  } else if (hp >= 4 && hp < 5) {
    rgbp = [x,0,c];
  } else if (hp >= 5 && hp < 6) {
    rgbp = [c,0,x]
  } else {
    rgbp = [0,0,0];
  }

  var m = hsl[2] - (c / 2);
  return [rgbp[0] + m, rgbp[1] + m, rgbp[2] + m];
}

function rgbString(rgb) {
  return '#' + rgb.map(function (x) {
    var hex = Math.floor(255 * x).toString('16');
    if (hex.length === 1) {
      return '0' + hex;
    }
    return hex;
  }).join('');
}

function getColors(N) {
  var s = 0.7;
  var l = 0.5;
  var steps = _.range(0, 1, 1/N);
  return steps.map(function (n) {
    return rgbString(hsl2rgb([360 * n, s, l]));
  });
}

function barGraph() {
  var margin =  {
    top: 40,
    right: 20,
    bottom: 80,
    left: 80
  };
  var width = 700 - margin.left - margin.right;
  var height = 700 - margin.top - margin.bottom;

  var svg;
  var xlabel;
  var ylabel;

  function chart(selection) {
    selection.each(function (data, i) {
      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1);

      var y = d3.scale.linear()
          .range([height, 0]);

      // TODO: we should postpone this until we know the X field
      var names = _.pluck(data, 'name');
      var colors = getColors(names.length);
      var color = d3.scale.ordinal().range(colors);
      // One bar per source.
      x.domain(names);


      var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom');

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .tickFormat(d3.format('.2s'));

      svg = d3.select(this).append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // TODO: We should postpone this until we know the Y field
      // Pull max stat values from the data.
      y.domain([0, 1.1 * d3.max(data, function (d) { return d.value; })]);

      // X axis
      var xEl = svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

      if (xlabel) {
        xEl.append('text')
        .attr('x', width / 2)
        .attr('dy', '40px')
        .style('text-anchor', 'middle')
        .text(xlabel);
      }

      // Y axis
      var yEl = svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis)

      if (ylabel) {
        yEl.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', - height / 2)
        .attr('dy', '-40px')
        .style('text-anchor', 'middle')
        .text(ylabel);
      }

      // Title
      if (title) {
        svg.append('g')
            .attr('class', 'title')
            .append('text')
            .attr('x', width / 2)
            .attr('dy', '-.5em')
            .style('text-anchor', 'middle')
            .text(title);
      }

      // Plot area background
      svg.append('g')
          .attr('transform', 'translate(0,' + height + ')')
        .append('g')
        .append('rect')
          .attr('y', -height)
          .attr('width', width)
          .attr('height', height)
          .attr('class', 'plot-area');

      // Grid lines
      var verticalGridlines = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .tickSize(-height, 0, 0)
          .tickFormat('');

      svg.append('g')
          .attr('class', 'grid')
          .attr('transform', 'translate(0,' + height + ')')
          .call(verticalGridlines)

      var horizontalGridlines = d3.svg.axis()
          .scale(y)
          .orient('left')
          .tickSize(-width, 0, 0)
          .tickFormat('');

      svg.append('g')
          .attr('class', 'grid')
          .call(horizontalGridlines)

      // Data
      var bar = svg.append('g').selectAll('rect')
          .data(data)
        .enter().append('g');

      // Bars
      bar.append('rect')
          .attr('class', 'bar')
          .attr('width', x.rangeBand())
          .attr('x', function (d) { return x(d.name); })
          .attr('y', function (d) { return y(d.value); })
          .attr('height', function (d) { return height - y(d.value); })
          .style('fill', function (d) { return color(d.name); });

      // Value text
      bar.append('text')
          .attr('x', function (d) { return x(d.name) + x.rangeBand() / 2;})
          .attr('y', function (d) { return y(d.value); })
          .attr('dy', '-.75em')
          .style('text-anchor', 'middle')
          .text(function (d) { return Math.round(d.value); });

      // Legend
      var legend = svg.selectAll('.legend')
          .data(_.pluck(data, 'name'))
        .enter().append('g')
          .attr('class', 'legend')
          .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

      legend.append('rect')
          .attr('x', width - 18)
          .attr('width', 18)
          .attr('height', 18)
          .style('fill', color);

      legend.append('text')
          .attr('x', width - 24)
          .attr('y', 9)
          .attr('dy', '.35em')
          .style('text-anchor', 'end')
          .text(function(d) { return d; });
    });
  }

  chart.width = function setWidth(w) {
    if (w === undefined) { return width + margin.left + margin.right; }
    width = w - margin.left - margin.right;
    return chart;
  };

  chart.height = function setHeight(h) {
    if (h === undefined) { return height + margin.top + margin.bottom; }
    height = h - margin.top - margin.bottom;
    return chart;
  };

  chart.xlabel = function (label) {
    xlabel = label;
    return chart;
  };

  chart.ylabel = function (label) {
    ylabel = label;
    return chart;
  }

  chart.title = function (t) {
    title = t;
    return chart;
  };

  return chart;
}

function oldbarGraph(options) {
  var $el = $(options.el);
  var margin = {top: 40, right: 20, bottom: 80, left: 80},
      width = $el.width() - margin.left - margin.right,
      height = $el.height() - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var names = _.pluck(options.data, 'name');
  var colors = getColors(names.length);
  var color = d3.scale.ordinal().range(colors);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .tickFormat(d3.format('.2s'));

  var svg = d3.select(options.el).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var data = options.data;

  // One bar per source.
  x.domain(names);

  // Pull max stat values from the data.
  y.domain([0, 1.1 * d3.max(data, function (d) { return d.value; })]);

  // X axis
  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
    .append('text')
      .attr('x', width / 2)
      .attr('dy', '40px')
      .style('text-anchor', 'middle')
      .text(options.xlabel);

  // Y axis
  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', - height / 2)
      .attr('dy', '-40px')
      .style('text-anchor', 'middle')
      .text(options.ylabel);

  // Title
  svg.append('g')
      .attr('class', 'title')
      .append('text')
      .attr('x', width / 2)
      .attr('dy', '-.5em')
      .style('text-anchor', 'middle')
      .text(options.title);

  // Plot area background
  svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
    .append('g')
    .append('rect')
      .attr('y', -height)
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'plot-area');

  // Grid lines
  var verticalGridlines = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickSize(-height, 0, 0)
      .tickFormat('');

  svg.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(0,' + height + ')')
      .call(verticalGridlines)

  var horizontalGridlines = d3.svg.axis()
      .scale(y)
      .orient('left')
      .tickSize(-width, 0, 0)
      .tickFormat('');

  svg.append('g')
      .attr('class', 'grid')
      .call(horizontalGridlines)

  // Data
  var bar = svg.append('g').selectAll('rect')
      .data(data)
    .enter().append('g');

  // Bars
  bar.append('rect')
      .attr('class', 'bar')
      .attr('width', x.rangeBand())
      .attr('x', function (d) { return x(d.name); })
      .attr('y', function (d) { return y(d.value); })
      .attr('height', function (d) { return height - y(d.value); })
      .style('fill', function (d) { return color(d.name); });

  // Value text
  bar.append('text')
      .attr('x', function (d) { return x(d.name) + x.rangeBand() / 2;})
      .attr('y', function (d) { return y(d.value); })
      .attr('dy', '-.75em')
      .style('text-anchor', 'middle')
      .text(function (d) { return Math.round(d.value); });

  // Legend
  var legend = svg.selectAll('.legend')
      .data(_.pluck(data, 'name'))
    .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

  legend.append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

  legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(function(d) { return d; });
}

function load(sources, done) {
  var promises = _.keys(sources).map(function (name) {
    return $.ajax({
      url: sources[name],
      dataType: 'text'
    });
  });
  $.when.apply($, promises)
  .done(function () {
    var data = _.pluck(_.toArray(arguments), 0);
    var names = _.keys(sources);
    done(null, data.map(function (text, i) {
      return {
        name: names[i],
        data: text.split('\n').map(function (s) { return +s; })
      };
    }));
  }).fail(function () {
    done(new Error('Failed to load data.'));
  })
}

function run(config) {
  load(config.sources, function (error, data) {
    if (error) { throw error; }

    d3.select('#graph-mean')
    .datum(_.map(data, function (source) {
      return {
        name: source.name,
        value: d3.mean(source.data)
      };
    }))
    .call(barGraph()
      .title('Mean response times')
      .xlabel('Run')
      .ylabel('response time (ms)')
    );

    d3.select('#graph-perc99')
    .datum(_.map(data, function (source) {
      return {
        name: source.name,
        value: d3.quantile(source.data.sort(d3.ascending), 0.99)
      };
    }))
    .call(barGraph()
      .title('Perc99 response times')
      .xlabel('Run')
      .ylabel('response time (ms)')
    );

    d3.select('#graph-max')
    .datum(_.map(data, function (source) {
      return {
        name: source.name,
        value: d3.max(source.data)
      };
    }))
    .call(barGraph()
      .title('Max response times')
      .xlabel('Run')
      .ylabel('response time (ms)')
    );

  });
}

$(function () {
  var data = window.location.hash.slice(1);
  var config = JSON.parse(atob(data));
  run(config);
  /*
   * Config format:
   * {
   *   "sources": {
   *     "labsandbox1": "http://s3.amazonaws.com/localdata-private/perf-data/localdata-tiles/simulated-flow/2014-03-11T07:38:14.704Z-44138c07df6b732bdd9b0b0f21097e51e4c3b6ae/times.csv",
   *     "labsandbox2": "http://s3.amazonaws.com/localdata-private/perf-data/localdata-tiles/simulated-flow/2014-03-11T07:53:44.829Z-44138c07df6b732bdd9b0b0f21097e51e4c3b6ae/times.csv",
   * 
   *     "labshared1": "http://s3.amazonaws.com/localdata-private/perf-data/localdata-tiles/simulated-flow/2014-03-12T14:18:42.610Z-a9ceb589d9fee1a50466c6a35e02588ae11067ea/times.csv",
   *     "labshared2": "http://s3.amazonaws.com/localdata-private/perf-data/localdata-tiles/simulated-flow/2014-03-12T14:22:35.239Z-a9ceb589d9fee1a50466c6a35e02588ae11067ea/times.csv",
   * 
   *     "hq1": "http://s3.amazonaws.com/localdata-private/perf-data/localdata-tiles/simulated-flow/2014-03-12T14:27:37.420Z-a9ceb589d9fee1a50466c6a35e02588ae11067ea/times.csv",
   *     "hq2": "http://s3.amazonaws.com/localdata-private/perf-data/localdata-tiles/simulated-flow/2014-03-12T14:29:44.713Z-a9ceb589d9fee1a50466c6a35e02588ae11067ea/times.csv"
   *   }
   * }
   *
   */
});
