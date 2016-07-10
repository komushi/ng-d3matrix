/* 0.1.4 */

( function () {
  'use strict';

  angular.module('ngD3matrix',[])
  .directive('adjacencyMatrix', function($parse, $window){
     return{
        restrict:'EA',
        scope: {
          data: '=',
          labelMap: '=',
          jsonPath: '@',
          width: '@',
          height: '@',
          id: '@',
          colorRange: '@'
        },
        template:"<svg></svg>",
        link: function(scope, elem, attrs){


          var margin = {
            top : 80,
            right : 40,
            bottom : 40,
            left : 80
          };

          var width = parseInt(scope.width),
              height = parseInt(scope.height);

          var d3 = $window.d3;

          var rawSvg = elem.find('svg');

          var svg = d3.select(rawSvg[0])
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("margin-left", margin.left + "px")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          var render = function(matrixJson){

            var x = d3.scale.ordinal().rangeBands([ 0, width ]);
            var cellSize = 12;
            var gapSize = 10;

            var getOpacity = d3.scale.linear().domain([ 0, 1 ]).clamp(true);
            var getColor = d3.scale.linear().domain([1,10])
              .interpolate(d3.interpolateHcl)
              .range(scope.colorRange.split(","));

            var setRow = function(row) {
              d3.select(this)
                .selectAll(".cell")
                .data(row)
                .enter()
                .append("rect")
                .attr("class", "cell")
                .attr("x", function(d) {
                  return x(d.x);
                })
                .attr("width", cellSize)
                .attr("height", cellSize)
                .style("fill-opacity", function(d) {
                  return getOpacity(d.z);
                })
                .style(
                    "fill",
                    function(d) {
                      var colorObj;
                      // if (nodes[d.y].rank) {
                      //  colorObj = getColor(nodes[d.y].rank);  
                      // }
                      
                      colorObj = getColor(d.c);

                      return colorObj;
                    })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
            }

            var mouseover = function(p) {
              // console.log(p);
              d3.selectAll(".row text").classed("active",
                  function(d, i) {
                    return i == p.y;
                  });
              d3.selectAll(".column text").classed("active",
                  function(d, i) {
                    return i == p.x;
                  });
            }
            
            var mouseout = function () {
              d3.selectAll("text").classed("active", false);
            }

            var wrap = function(text, width, isHorizontal) {
              text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight,
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                if (isHorizontal) {
                  lineHeight = 1.1;
                }
                else {
                  lineHeight = 0.1;
                }
                while (word = words.pop()) {
                  line.push(word);
                  tspan.text(line.join(" "));
                  if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                  }
                }
              });
            }

            // remove all previous items before render
            svg.selectAll("*").remove();

            var matrix = [], nodes = matrixJson.nodes, n = nodes.length, links = matrixJson.links;

            // Compute index per node.
            nodes.forEach(function(node, i) {
              node.count = 0;
              node.group = 0;
              matrix[i] = d3.range(n).map(function(j) {
                return {
                  x : j,
                  y : i,
                  z : 0,
                  c : 0
                };
              });
            });

            cellSize = width / n;
            
            // Convert links to matrix; count character occurrences.
            matrixJson.links.forEach(function(link) {

              matrix[link.source][link.target].z = link.value;
              matrix[link.source][link.target].c = link.rank;
         
              nodes[link.source].group = 1;

              if (nodes[link.source].group > 0) {
                nodes[link.source].count += link.value;
                nodes[link.source].rank = link.rank;
              }
            });
console.log(JSON.stringify(nodes));
            // Precompute the orders.
            var orders = {
              name : d3.range(n).sort(
                  function(a, b) {
                    return d3.ascending(nodes[a].name,
                        nodes[b].name);
                  }),
              count : d3.range(n).sort(function(a, b) {
                if (nodes[b].count == nodes[a].count) {
                  return nodes[a].rank - nodes[b].rank;
                }
                else {
                  return nodes[b].count - nodes[a].count;
                }
              })
            };

            // The default sort order.
            x.domain(orders.count);

            svg.selectAll(".row")
              .data(matrix)
              .enter()
              .append("g")
              .attr("class", "row")
              .attr(
                  "transform", function(d, i) {
                    return "translate(0," + x(i) + ")";
                  })
              .each(setRow)
              .append("text")
              .attr("x", -6)
              .attr("y",
                function(d, i) {
                  return 0;
                })
              .attr("dy", ".9em")
              .attr("text-anchor", "end")
              .text(
                  function(d, i) {
                    return nodes[i].name;
                  });

            svg.selectAll(".row text")
              .call(wrap, margin.left, true);


            svg.selectAll(".column")
              .data(matrix)
              .enter()
              .append("g")
              .attr("class", "column")
              .attr(
                  "transform",
                  function(d, i) {
                    return "translate(" + x(i)
                        + ")rotate(-90)";
                  })
              .append("text")
              .attr("x", 6)
              .attr("dy", ".9em")
              .attr("text-anchor", "start")
              .text(
                  function(d, i) {
                    return nodes[i].name;
                  });

            svg.selectAll(".column text")
              .call(wrap, margin.top, false);
          }


          if (scope.jsonPath) 
          {
            // load graph (nodes,links) json from /graph endpoint
            d3.json(scope.jsonPath, function(error, json) {
                if (error) 
                  {
                    console.error(error);
                    return;
                  }
                  render(json);
            });
          }
          else
          {
            // watch for data changes and re-render
            scope.$watch('data', function(newVals, oldVals) {
              if (newVals) 
              {
                return render(newVals);
              }
            }, true);  
          }

          d3.select(self.frameElement).style("height", height + "px");
        }
     };
  });
}() );