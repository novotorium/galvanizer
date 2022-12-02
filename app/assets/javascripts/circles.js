function circles() {
  "use strict";
  var svg = d3.select("svg"),
    margin = 20,
    diameter = svg.style("width").slice(0, -2),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
  svg.attr('height', diameter);

  var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

  d3.json("/circles.json", function (error, data) {
    if (error) { throw error; }

    data.linked.supported_roles || (data.linked.supported_roles = data.circles);

    // CIRCLES dont have a circle defined which is the parent
    // they have a supported_role where the circle is defined.
    data.circles.forEach(function (d) {
      data.linked.supported_roles.forEach(function (e) {
        if (d.links.supported_role === e.id) {
          d.links.circle = e.links.circle;
        }
      }, d);
    }, data);

    // Delete repeated roles
    for (var i = data.linked.supported_roles.length - 1; i >= 0; i--) {
      for (var index = data.linked.roles.length - 1; index >= 0; index--) {
        if (data.linked.supported_roles[i].id === data.linked.roles[index].id) {
          data.linked.roles.splice(index, 1);
        }
      }
    }

    var clean_data = data.circles.concat(data.linked.roles);

    var root = d3.stratify()
      .id(function (d) { return d.id; })
      .parentId(function (d) { return d.links.circle; })
      (clean_data);

    d3.format(",d");

    var color = ['#286CB3', '#1A4675', '#112E4D', '#286CB3'];

    function suma() {
      return 1;
    }

    root.sum(suma);
    root.sort(function (a, b) {
      return -(a.id - b.id);
    });

    function getAccountabilities(role) {
      var ids = role.data.links.accountabilities;
      function getAccountabilitiesStr(ids, accountabilities) {
        var str = "<ul>";
        var found = 0;
        for (var i = 0; i < accountabilities.length; i++) {
          for (var j = 0; j < ids.length; j++) {
            if (accountabilities[i].id == ids[j]) {
              str = str + "<li>" + accountabilities[i].description + "</li>";
              found++;
              break;
            }
          }
          if (found == ids.length + 1) {
            break;
          }
        }
        return str + "</ul>";
      }
      return getAccountabilitiesStr(ids, window.roles.linked.accountabilities);
    }
    function openRole(role) {
      if (role.children) {
        if (focus !== role) { zoom(role), d3.event.stopPropagation(); }
        return;
      }
      d3.event.stopPropagation();
      $(".modal-body h1").text(role.data.name)
      $(".modal-body p:nth(0)").text(role.data.purpose ? role.data.purpose : "")
      $(".modal-body p:nth(1)").html(getAccountabilities(role));

      $("button#join").hide();
      if (typeof (role.data.links.people) !== 'undefined' &&
        role.data.links.people.length === 0) {
        $("button#join").show();
      }

      $("#modal").modal('show');

      ga('send', 'event', 'role', 'zoom', role.data.name);
    }

    var focus = root,
      nodes = pack(root).descendants(),
      view;

    var circle = g.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("class", function (d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .classed("unfilled", function (d) {
        if (typeof (d.data.links.people) !== 'undefined' &&
          d.data.links.people.length === 0) {
          return true;
        }
      })
      .style("fill", function (d) {
        return d.children ? color[d.depth] : null;
      })
      .on("click", openRole);

    g.selectAll("text")
      .data(nodes)
      .enter().append("text")
      .style("fill-opacity", function (d) { return d.parent === root ? 1 : 0; })
      .style("display", function (d) { return d.parent === root ? "inline" : "none"; })
      .attr("clip-path", function (d) { return "url(#clip-" + d.id + ")"; })
      .style("font-size", function (d) {
        return Math.floor(d.r / 3.5);
      })
      .on("click", openRole)
      .selectAll("tspan")
      .data(function (d) { return d.data.name.split(" "); })
      .enter().append("tspan")
      .attr("x", 0)
      .attr("y", function (d, i, nodes) {
        return 1.1 + (i - nodes.length / 2 - 0.5) + 'em';
      })
      .text(function (d) { return d; });

    var node = g.selectAll("circle,text");

    svg
      .on("click", function () { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
      var focus0 = focus; focus = d;
      var label = focus0.data.name + ' to ' + focus.data.name;
      ga('send', 'event', 'role', 'zoom', label);

      var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function () {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function (t) { zoomTo(i(t)); };
        });

      transition.selectAll("text")
        .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function (d) { return d.parent === focus ? 1 : 0; })
        .on("start", function (d) { if (d.parent === focus) { this.style.display = "inline"; } })
        .on("end", function (d) { if (d.parent !== focus) { this.style.display = "none"; } });
    }

    function zoomTo(v) {
      var k = diameter / v[2]; view = v;
      node.attr("transform", function (d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
      circle.attr("r", function (d) { return d.r * k; });
    }

  });
  function hovered(hover) {
    return function (d) {
      d3.selectAll(d.ancestors().map(function (d) {
        return d.node;
      })).classed("node--hover", hover);
    };
  }
}
circles();

// Prefetching roles where accountabilities data lives.
(function () {
  //Prefetch accountabilities
  if (!window.roles) {
    d3.json("/roles.json", function (error, data) {
      if (error) { throw error; }
      window.roles = data;
    });
  }
  var id, lastWidth = $(".circles").width(), lastHeight = $(".circles").height();
  $(window).on('resize', function () {
    clearTimeout(id);
    id = setTimeout(doneResizing, 200);
  });
  function doneResizing() {
    if (lastWidth === $(".circles").width() && lastHeight === $(".circles").height()) {
      // Size didn't change we dont need to redraw.
      return;
    }
    lastWidth = $(".circles").width();
    lastHeight = $(".circles").height();

    $("svg").empty();
    circles();
  }
  // We modify the modal on join
  $("button#join").on('click', function () {
    $(".modal-body .row:nth(0) .col-lg-12").addClass("col-lg-6").removeClass("col-lg-12");
    $(".modal-body .row:nth(1)").fadeIn();
    $("button#join").fadeOut();
  });
  // We set the modal back on close
  $("#modal").on('hidden.bs.modal', function () {
    $(".modal-body .row:nth(0) .col-lg-6").addClass("col-lg-12").removeClass("col-lg-6");
    $(".modal-body .row:nth(1)").fadeOut();
    $("button#join").fadeIn();
  });
})();
