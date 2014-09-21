'use strict';

/**
 * @ngdoc function
 * @name learnStarsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the learnStarsApp
 */
angular.module('learnStarsApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
