(function() {
  var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  }
  var width = 960 - margin.left - margin.right
  var height = 150 - margin.top - margin.bottom
  var x = d3.scaleBand()
    .range([0, width])
  var y = d3.scaleLinear()
    .range([height, 0])
    .tickFormat(5, "+%");
  var svg = d3.select('.chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  var startDate = moment()
  var endDate = moment().add(21, 'days')

  function getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    while (currentDate <= stopDate) {
      dateArray.push( {
        date: moment(currentDate).format('DD MMM') ,
        day: moment(currentDate).format('ddd')
      })
      currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
  }

  function isWeekday(day) {
    return (day === 'Sun' || day === 'Sat') ? false : true
  }

  fetch( '/api/v1/events' ).then( function ( response ) {
    return response.json()
  } ).then( function ( body ) {
    var events = body.events
    var dateArrays = getDates(startDate, endDate) // next 21 days
    var chartValues = {}
    var data = []

    events.forEach(function(eachEvent) {
      var dateNode = eachEvent.formatted_time.substring(0,6)

      if (chartValues[ dateNode ]) {
        chartValues[ dateNode ] += 1
      } else {
        chartValues[ dateNode ] = 1
      }
    })

    dateArrays.forEach(function(eachDate, index) {
      data.push({
        date: index === 0 ? 'today' : eachDate.date,
        events: chartValues[ eachDate.date ] ? chartValues[ eachDate.date ].toString() : '0',
        weekday: isWeekday(eachDate.day)
      })
    })

    var maxY = 0
    data.forEach(function (d) {
      maxY = Math.max(d.events, maxY)
    })

    x.domain(data.map(function(d) { return d.date }))
    y.domain([0, maxY])

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))

    svg.append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Events')

    svg.selectAll('.column')
      .data(data)
      .enter().append('rect')
      .attr('class', function(d) {
        if (d.weekday) {
          return 'column'
        } else {
          return 'column-light'
        }
      })
      .attr('x', function(d) { return x(d.date) })
      .attr('width', x.bandwidth())
      .attr('y', function(d) { return y(d.events) })
      .attr('height', function(d) { return height - y(d.events) })
  } )
})()
