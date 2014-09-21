'use strict';

/**
 * @ngdoc function
 * @name learnStarsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the learnStarsApp
 */
angular.module('learnStarsApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
