'use strict';

/**
 * @ngdoc directive
 * @name learnStarsApp.directive:starmap
 * @description
 * # starmap
 */
angular.module('learnStarsApp')
  .directive('starmap', function () {
    return {
      controller: 'StarmapCtrl',
      controllerAs: 'starmapCtrl',
      template: '<canvas id="fabric-canvas"></canvas>',
      restrict: 'E'
    };
  });
