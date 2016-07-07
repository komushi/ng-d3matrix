/* 0.1.1 */

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
            top : 60,
            right : 40,
            bottom : 40,
            left : 60
          };

          var width = parseInt(scope.width),
              height = parseInt(scope.height);

          var d3 = $window.d3;

          var x = d3.scale.ordinal().rangeBands([ 0, width ]);
          var cellSize = 12;
          var gapSize = 10;
          var getOpacity = d3.scale.linear().domain([ 0, 1 ]).clamp(true);
          // var getColor = d3.scale.category10().domain(d3.range(10));
          
          // var getColor = d3.scale.ordinal().domain([0, 1, 2])
          //         .range(['red', 'blue', 'purple']);
                  // .range(['#e6550d', '#756bb1', '#3182bd']);

          var getColor = d3.scale.linear().domain([1,10])
            .interpolate(d3.interpolateHcl)
            .range(scope.colorRange.split(","));
            // .range([d3.rgb('#0d47a1'), d3.rgb('#e3f2fd')]);


          var rawSvg = elem.find('svg');

          var svg = d3.select(rawSvg[0])
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("margin-left", margin.left + "px")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
            console.log(p);
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


          var render = function(matrixJson){

            // remove all previous items before render
            svg.selectAll("*").remove();

            var matrix = [], nodes = matrixJson.nodes, n = nodes.length, links = matrixJson.links;

            // Compute index per node.
            nodes.forEach(function(node, i) {
              node.count = 0;
              matrix[i] = d3.range(n).map(function(j) {
                return {
                  x : j,
                  y : i,
                  z : 0,
                  c : 0
                };
              });
            });

// console.log(matrix); 

            cellSize = width / n;
            
            // Convert links to matrix; count character occurrences.
            matrixJson.links.forEach(function(link) {


              matrix[link.source][link.target].z = link.value;
              matrix[link.source][link.target].c = nodes[link.source].rank;
         
              if (nodes[link.source].rank) {
                if (link.value > nodes[link.source].count) {
                  nodes[link.source].count = link.value;  
                }
              }

              
            });

// console.log(matrix.length); 
            // Precompute the orders.
            var orders = {
              name : d3.range(n).sort(
                  function(a, b) {
                    return d3.ascending(nodes[a].name,
                        nodes[b].name);
                  }),
              count : d3.range(n).sort(function(a, b) {
                return nodes[b].count - nodes[a].count;
              }),
              rank : d3.range(n).sort(function(a, b) {
                return nodes[b].rank - nodes[a].rank;
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