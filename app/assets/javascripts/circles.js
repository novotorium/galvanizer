function circles() {
  "use strict";
  var svg = d3.select("svg"),
    margin = 20,
      diameter = svg.style("width").slice(0,-2),
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
        svg.attr('height', diameter);


        var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

        d3.json("/circles.json", function(error, data){
          if(error) { throw error; }
          /* CIRCLES dont have a circle defined which is the parent
             they have a supported_role where the circle is defined.
             */
          data.circles.forEach(function(d){
            data.linked.supported_roles.forEach(function(e){
              if(this.links.supported_role === e.id){
                this.links.circle = e.links.circle;
              }
            }, d);
          }, data);

          // Delete repated roles
          for(let role of data.linked.supported_roles){
            for(var index = data.linked.roles.length -  1; index >= 0; index--)
            {
              if(role.id === data.linked.roles[index].id){
                data.linked.roles.splice(index, 1);
              }
            }
          }

          var clean_data = data.circles.concat(data.linked.roles);

          var root = d3.stratify()
          .id(function(d) { return d.id; })
          .parentId(function(d) { return d.links.circle; })
          (clean_data);

          d3.format(",d");

          var color = ['#286CB3','#1A4675','#112E4D', '#286CB3'];

          function suma(){
            return 1;
          }

          root.sum(suma);
          root.sort(function(a, b){
            return -(a.id - b.id);
          });

          function openRole(role){
            if(role.children) { return; }
            d3.event.stopPropagation();
            console.log(role);
          }

          var focus = root,
            nodes = pack(root).descendants(),
              view;

              var circle = g.selectAll("circle")
              .data(nodes)
              .enter().append("circle")
              .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
              .style("fill", function(d) {
                return d.children ? color[ d.depth ] : null;
              })
              .on("click", function(d) { if (focus !== d) { zoom(d), d3.event.stopPropagation(); } });

              g.selectAll("text")
              .data(nodes)
              .enter().append("text")
              .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
              .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
              .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
              .style("font-size", function(d) {
                return Math.floor(d.r/3.5);
              })
              .on("click", openRole)
              .selectAll("tspan")
              .data(function(d) { return d.data.name.split(" "); })
              .enter().append("tspan")
              .attr("x", 0)
              .attr("y", function(d, i, nodes) {
                return 1.1 + (i - nodes.length / 2 - 0.5) + 'em';
              })
              .text(function(d) {return d; });

              var node = g.selectAll("circle,text");

              svg
              .on("click", function() { zoom(root); });

              zoomTo([root.x, root.y, root.r * 2 + margin]);

              function zoom(d) {
                var focus0 = focus; focus = d;

                var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function() {
                  var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                  return function(t) { zoomTo(i(t)); };
                });

                transition.selectAll("text")
                .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
                .on("start", function(d) { if (d.parent === focus) { this.style.display = "inline"; } })
                .on("end", function(d) { if (d.parent !== focus) { this.style.display = "none"; } });
              }

              function zoomTo(v) {
                var k = diameter / v[2]; view = v;
                node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
                circle.attr("r", function(d) { return d.r * k; });
              }

        });
        function hovered(hover) {
          return function(d) {
            d3.selectAll(d.ancestors().map(function(d) {
              return d.node;
            })).classed("node--hover", hover);
          };
        }
}
circles();
var id;
$( window ).on('resize', function() {
  clearTimeout(id);
  id = setTimeout(doneResizing, 200);
});
function doneResizing(){
  $("svg").empty();
  circles();
}
