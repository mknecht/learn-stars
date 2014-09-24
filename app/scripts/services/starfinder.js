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

      /**
       * Resolves the deferred, if executed asynchronously,
       * i.e. outside of an Angular digest cycle.
       *
       * $apply is needed, because nextTick() is used in .resolve()
       * and we need to make sure Angular is aware a tick is necessary.
       * (Which does not happen in unit tests.)
       * http://comments.gmane.org/gmane.comp.lang.javascript.angularjs/6717
       */
      function resolveWithAngular(deferred, value) {
        $rootScope.$apply(function() {
          deferred.resolve(value)
        })
      }

      Caman.Filter.register('histogram', function(deferred) {
        var histogram = {}
        this.process('histogram', function(rgba) {
          var luminance = Caman.Calculate.luminance(rgba) | 0
          histogram[luminance] = histogram[luminance] + 1 || 1
          if (rgba.loc === rgba.c.pixelData.length - 3 - 1) {
            resolveWithAngular(deferred, histogram)
          }
          return rgba
        })
        return this
      })

      function determineThreshold(percentageOfArea, histogram, caman)   {
        // min-pixels need to be a few, so that small test cases work, too.
        var minPixels = (Math.max(100, caman.dimensions.height * caman.dimensions.width) * percentageOfArea / 100) | 0
        var accumulatedPixels = 0
        var luminance = 255
        while (luminance > 0 && accumulatedPixels < minPixels) {
          accumulatedPixels += histogram[luminance] || 0
          luminance -= 1
        }
        return Math.max(0, Math.min(255, luminance + 1))
      }

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
          var deferredStars = $q.defer()
          var deferredThreshold = $q.defer()
          caman
            .histogram(deferredThreshold)
            .render()
          deferredThreshold.promise.then(function(histogram) {
            var brightnessThreshold = determineThreshold(
              5, // Percentage of image area, starting with the brightest.
              histogram,
              caman
            )
            caman.threshold(brightnessThreshold).render(function() {
              var that = this
              resolveWithAngular(
                deferredStars, selectCenters(findWhiteAreas(that)))
            })
          })

          return deferredStars.promise
        }
      }
    }])
