/*global Uint8Array */
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

      function findWhiteAreas(caman) {
        var maxrange = caman.dimensions.width * caman.dimensions.height
        var areaUsingCounters
        var ctr
        var i
        var known = Uint8Array(maxrange)
        var stack = []
        var top
        var whiteAreas = []

        function addToStackIfUnknownAndWhite(origin, xdiff, ydiff) {
          var ctr = Math.max(0, Math.min(maxrange, origin + xdiff + ydiff * caman.dimensions.width))
          if (caman.pixelData[ctr * 4] === white && !known[ctr]) {
            stack.push(ctr)
            known[ctr] = true
          }
        }

        for (i = 0; i < caman.pixelData.length; i += 4) {
          ctr = i / 4
          addToStackIfUnknownAndWhite(ctr, 0, 0)
          areaUsingCounters = []
          while (top = stack.pop()) {
            areaUsingCounters.push(top)
            addToStackIfUnknownAndWhite(top, -1, 0)
            addToStackIfUnknownAndWhite(top, +1, 0)
            addToStackIfUnknownAndWhite(top, 0, -1)
            addToStackIfUnknownAndWhite(top, 0, +1)
          }
          if (areaUsingCounters.length > 0) {
            whiteAreas.push(areaUsingCounters.map(
              function(pixelCounter) {
                return [
                  pixelCounter % caman.dimensions.width
                , (pixelCounter / caman.dimensions.width) | 0
                ]}))
          }
        }
        return whiteAreas
      }

      function selectCenters(areas) {
        return areas.map(function(area) {
          return area[0]
        })
      }

      return {
        findStars: function(caman) {
          // TODO determine automatically by histogram analysis
          var brightnessThreshold = 50
          var deferred = $q.defer()

          caman.threshold(brightnessThreshold).render(function() {
            var that = this
            // $apply is needed, because nextTick() is used in .resolve()
            // and we need to make sure Angular is aware a tick is necessary.
            // (Which does not happen in unit tests.)
            // http://comments.gmane.org/gmane.comp.lang.javascript.angularjs/6717
            $rootScope.$apply(function () {
              deferred.resolve(selectCenters(findWhiteAreas(that)))
            });
          })

          return deferred.promise
        }
      }
    }])
