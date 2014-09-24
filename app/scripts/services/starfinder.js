'use strict';

/**
 * @ngdoc service
 * @name learnStarsApp.starFinder
 * @description
 * # starFinder
 * Factory in the learnStarsApp.
 */
var app = angular.module('learnStarsApp')
app.factory('starFinder',
  ['$q', '$rootScope', 'Caman',
    function ($q, $rootScope, Caman) {
      var white = 255
      var black = 0

      ;(function(filterName) {
        Caman.Filter.register(filterName, function(threshold) {
          this.process(filterName, function(rgba) {
            var luminance = Caman.Calculate.luminance(rgba)
            rgba.r = rgba.g = rgba.b = luminance > threshold ? white : black
            rgba.a = 255
            return rgba
          })
          return this
        })
      })("applyThreshold")

      function findWhitePixels(caman) {
        var i
        var whitePixels = []
        for (i = 0; i < caman.pixelData.length; i += 4) {
          if (caman.pixelData[i] === white) {
            whitePixels.push([(i / 4) % caman.dimensions.width, ((i / 4) / caman.dimensions.width) | 0])
          }
        }
        return whitePixels
      }

      return {
        findStars: function(caman) {
          // TODO determine automatically by histogram analysis
          var brightnessThreshold = 50
          var deferred = $q.defer()

          caman.applyThreshold(brightnessThreshold).render(function() {
            var that = this
            // $apply is needed, because nextTick() is used in .resolve()
            // and we need to make sure Angular is aware a tick is necessary.
            // (Which does not happen in unit tests.)
            // http://comments.gmane.org/gmane.comp.lang.javascript.angularjs/6717
            $rootScope.$apply(function () {
              deferred.resolve(findWhitePixels(that))
            });
          })

          return deferred.promise
        }
      }
    }])
