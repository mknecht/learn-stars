/*global angular FileReader Image */
'use strict';

/**
 * @ngdoc function
 * @name learnStarsApp.controller:ImagesuploadCtrl
 * @description
 * # ImagesuploadCtrl
 * Controller of the learnStarsApp
 */
angular
  .module('learnStarsApp')
  .controller('ImagesuploadCtrl',
    ['$scope', '$rootScope', '$compile', '$log', '$window', 'jQuery', 'starFinder', '$injector', 'Caman',
      function ($scope, $rootScope, $compile, $log, $w, $, starFinder, $injector, Caman) {
        var $img = angular.element('<img/>')

        $scope.addingFile = function($file) {
          var fileReader = new FileReader();
          fileReader.readAsDataURL($file.file);
          fileReader.onload = function (event) {
            var image = new Image()
            image.src = event.target.result
            $rootScope.$broadcast('image-uploaded', {'image': image})

            var $camanCanvas = $('canvas#caman-canvas')
            $camanCanvas.attr('height', image.naturalHeight)
            $camanCanvas.attr('width', image.naturalWidth)
            var context = $camanCanvas[0].getContext("2d")
            context.drawImage(image, 0, 0)
            Caman($camanCanvas[0], function() {
              var starsPromise = starFinder.findStars(this)
              starsPromise.then(function(stars) {
                $log.debug("Found " + stars.length + " stars.")
                $rootScope.$broadcast('found-stars', {stars: stars})
              })
            })
          };
        }
        $scope.debug = false
      }
    ]
  )
