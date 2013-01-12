
  var cs = holes.selectAll("svg:circle")
    .append("circle")
    .attr("cx", w)
    .attr("cy", height)
    .attr("r", 15)
    .style("fill", function(d) { return d3.hsl(deg(d), 1, 0.75); })
    ;




var labys = g.selectAll('text')
  .data(ns.ts.ticks(23))
.enter().append("text")
  .attr("x", t2w)
  .attr("y", height)
  .attr("transform", function(d) {
      return "rotate(72 " + t2w(d) + " " + height + ")";
  })
  .text(function(d) { return d.toLocaleDateString(); });

d3.json("/static/mailcal.json", function(error, mails) {

  var M = mails['mails'];
  var C = mails['contacts'];

  var contacts = svg.selectAll("circle")
    .data(C)
  .enter().append("circle")
    .each(function(d, i) {
      km[d] = {
        col: d3.hsl(Math.random() * 360, 1, 0.75),
        i: i
      };
    })

  var node = g.selectAll("ellipse.node")
    .data(M)
  .enter().append("ellipse")
    .each(function(d) { d.d = new Date(d['Date']); })
    .attr("class", "node")
    .attr("cx", function() { return Math.random() * width; })
    .attr("cy", function() { return Math.random() * height * 2; })
    .attr("rx", 0.1)
    .attr("ry", 0.1)
    .each(function(d) {

      var angle = ns.rad(monthish(d.d));
      var cosy = Math.cos(angle);
      var siny = Math.sin(angle);

//      var siny = Math.sin(ns.rad(weekish(d.d)));
//      var cosys = Math.sin(ns.rad(weekish(d.d)));

      var x = t2w(d.d) - siny * 15 ; // * (0.5 - ns.ts(d.d));
      var y = height + cosy * height * 0.7;

      d3.select(this)
      .transition()
        .delay(function(d) { return Math.random() * 1000; })
        .duration(function(d) { return 500 + Math.random() * 2000; })
        .ease("circle")
        .attr("class", "node")
        .attr("rx", 3)
        .attr("ry", 10)
        .attr("cx", x)
        .attr("cy", y)
        .style("fill", function(d) {
          return km[d['From']].col;
        });

    });

  node.append("title").text(function(d) { return d["Subject"]; });

});

function aaaa() {
  svg.selectAll("ellipse").transition()
    .duration(1000)
    .attr("cx", function(d) {
      var angle = ns.rad(monthish(d.d));
      return t2w(d.d) + Math.sin(angle) * marg;
    })
    .attr("cy", function(d) {
      var angle = ns.rad(monthish(d.d));
      return height + Math.cos(angle) * height * 0.7;
    })
    .attr("ry", function(d) {
      var angle = ns.rad(monthish(d.d));
      return 15 - Math.abs(Math.sin(angle)) * 12;
    })
    .attr("rx", function(d) {
      var angle = ns.rad(monthish(d.d));
      return 15 - (Math.sin(-angle)) * 12;
    });
}
function bbbb() {
  svg.selectAll("ellipse").transition()
    .duration(1000)
    .attr("cx", function(d) {
      var angle = ns.rad(weekish(d.d));
      return t2w(d.d) ;//- Math.sin(angle) * marg;
    })
    .attr("cy", function(d) {
      return marg + 3 * km[d['From']].i;
    })
    .attr("ry", function(d) {
      return 15 - dayish(d.d) * 12;
    })
    .attr("rx", function(d) {
      return 15 - weekish(d.d) * 12;
    });
}

function zoomin() {
  g.transition()
    .duration(1000)
    .attr("transform", function(d) {
      var scale_factor = 0.68;
      var x = width * scale_factor / 4;
      var y = height * scale_factor / 2;
      return "translate(" + x + " " + y + ") scale(" + scale_factor + ")";
    });
  return False;
}

function zoomout() {
  g.transition()
    .duration(1000)
    .attr("transform", "translate(0 0) scale(1.0)");
  return False;
}

  $("#zoom").toggle(zoomin, zoomout);

  $("#clickit").toggle(aaaa, bbbb);

