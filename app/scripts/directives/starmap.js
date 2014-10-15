/*global angular */
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
      template: '<canvas></canvas>',
      restrict: 'E',
      link: function postLink(scope, iElement, iAttrs, controller, transcludeFn) {
        controller.init(iElement[0].children[0], iAttrs.eventId)
      }
    };
  });
