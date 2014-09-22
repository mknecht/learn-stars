'use strict';

/**
 * @ngdoc function
 * @name learnStarsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the learnStarsApp
 */
angular
  .module('learnStarsApp')
  .controller('MainCtrl',
    ['$scope', 'jQuery', 'starFinder',
      function ($scope, $, starFinder) {
        $scope.addingFile = function($file) {
          $scope.newImage = $file
        }

        $('#img2')[0].onload = function() {
          $('canvas#im').attr("height", $('#img2').height())
          $('canvas#im').attr("width", $('#img2').width())
          var canvas = $('canvas#im')[0]
          var context = canvas.getContext("2d")
          context.drawImage($('#img2')[0], 0, 0)
          context.putImageData(
            starFinder.produceBlackAndWhite(
              context,
              context.getImageData(0, 0, canvas.width, canvas.height)),
            0,
            0
          )
        }
      }
    ]
  )