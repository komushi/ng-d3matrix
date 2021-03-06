# Angular Directives for d3 matrix

![Adjacency Matrix](https://raw.githubusercontent.com/komushi/ng-d3matrix/master/image/matrix.png)

----------
Local Demo
-------------
###Download & Installation
```
git clone https://github.com/komushi/ng-d3matrix.git
cd ng-d3matrix/examples
live-server
```
###Access the local server
http://localhost:8080

----------
Quick Start
-------------
### Install via Bower
```
bower install --save ng-d3matrix
```

### Usage
```
<!DOCTYPE html>
<html>

<head>
  <title>matrix</title>
    <script src="https://code.angularjs.org/1.5.7/angular.min.js"></script>
    <script data-require="d3@*" data-semver="3.5.3" src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.6.7/d3-tip.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/rxjs/4.1.0/rx.all.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/rx-angular/1.1.3/rx.angular.min.js"></script>
    <script type="text/javascript" src="https://rawgit.com/komushi/ng-d3matrix/master/src/ng-d3matrix.js"></script> 
    <link rel="stylesheet" href="https://rawgit.com/komushi/ng-d3matrix/master/src/css/ng-d3matrix.css" /> 

</head>


<body ng-app="d3matrixApp">

<script>
var app = angular.module("d3matrixApp", ['ngD3matrix']); 
app.controller("matrixCtrl", ['$scope', '$http', function($scope, $http) {
  
  // Adjacency Matrix
  $http.get('data/top1.json')
       .success(function(res){
          $scope.matrixJson = res;
        });

}]);
</script>

<div ng-controller="matrixCtrl">
  <div style="width:800px; margin:0 auto;">
    <h2>Adjacency Matrix - Top Ten</h2>
    <div adjacency-matrix
      data="matrixJson"
      width="800"
      height="800"
      json-path=""
      color-range="#0d47a1,#e3f2fd">
    </div>
  </div>
</div>


</body>
</html>


```