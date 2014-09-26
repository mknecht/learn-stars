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
       * Monkey-patch a coherant luminance calculation.
       * https://github.com/meltingice/CamanJS/issues/155
       * Choosing the one from Filter.threshold(), since
       * it's easier to fix and it's the one supported by WP ;)
       * http://en.wikipedia.org/wiki/Relative_luminance
       **/
      Caman.Calculate.luminance = function(rgba) {
        return (0.2126 * rgba.r) + (0.7152 * rgba.g) + (0.0722 * rgba.b)
      }

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
        function isLast(rgba) {
          return rgba.loc === rgba.c.pixelData.length - 3 - 1
        }
        function evenOut(histogram) {
//          console.log("====================================")
//          histogram.forEach(function(it, idx) { console.log(idx + " = " + it) })
          var first = histogram.reduce(function(data, value, idx) {
            return (data !== undefined) ? data : ((value !== undefined) ? idx : data)
          }, undefined)
          var last = histogram.reduce(function(data, value, idx) {
            return (value !== undefined) ? idx : data
          }, undefined)
          // In the pathological case of only one color,
          // we leave the threshold as is.
          var factor = ((last - first) > 0) ? (255 / (last - first)) : 1
          console.log("factor: " + factor)
          console.log("first: " + first)
          console.log("last: " + last)
          var evened = histogram.reduce(function(data, value, originalIndex) {
            var newIndex = ((originalIndex - first) * factor) | 0
            console.log(originalIndex + " -> " + newIndex)
            data[newIndex] = (data[newIndex] || 0) + value
            return data
          }, [])
          console.log("evened")
          console.log("evened: " + evened)
          evened.forEach(function(it, idx) { console.log(idx + " = " + it) })
          return {data: evened, factor: factor, first: first}
        }
        var histogram = []
        this.process('histogram', function(rgba) {
          var luminance = Caman.Calculate.luminance(rgba) | 0
          histogram[luminance] = histogram[luminance] + 1 || 1
          if (isLast(rgba)) {
            resolveWithAngular(deferred, evenOut(histogram))
          }
          return rgba
        })
        return this
      })

      function determineThreshold(percentageOfArea, maxClasses, histogram, caman)   {
        // min-pixels need to be a few, so that small test cases work, too.
        var minPixels = (Math.max(100, caman.dimensions.height * caman.dimensions.width) * percentageOfArea / 100) | 0
        var accumulatedPixels = 0
        var luminance = 255
        var classesFound = 0
        while (luminance > 0 && accumulatedPixels < minPixels && classesFound < maxClasses ) {
          classesFound += 1
          accumulatedPixels += histogram.data[luminance] || 0
          luminance -= 1
        }
        var thresholdOnBalanced = luminance + 1
        console.log("balanced T: " + thresholdOnBalanced)
        var thresholdOnOriginal = ((thresholdOnBalanced / histogram.factor) | 0) + histogram.first
        console.log("original T: " + thresholdOnOriginal)
        console.log("accumulated pixels: " + accumulatedPixels)
        return Math.max(0, Math.min(255, thresholdOnOriginal))
      }

      function findWhiteAreas(caman) {
        var maxrange = caman.dimensions.width * caman.dimensions.height
        var areaUsingCounters
        var ctr
        var i
        var known = new Uint8Array(maxrange)
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
            addToStackIfUnknownAndWhite(top, -1, -1)
            addToStackIfUnknownAndWhite(top, +0, -1)
            addToStackIfUnknownAndWhite(top, +1, -1)
            addToStackIfUnknownAndWhite(top, +1, +0)
            addToStackIfUnknownAndWhite(top, +1, +1)
            addToStackIfUnknownAndWhite(top, +0, +1)
            addToStackIfUnknownAndWhite(top, -1, +1)
            addToStackIfUnknownAndWhite(top, -1, +0)
          }
          if (areaUsingCounters.length > 0) {
            whiteAreas.push(areaUsingCounters.map(function(pixelCounter) {
              return [
                pixelCounter % caman.dimensions.width
              , (pixelCounter / caman.dimensions.width) | 0
              ]}))
          }
        }
        return whiteAreas
      }

      function selectCenterAndRadius(areas) {
        return areas.map(function(area) {
          var cumulated = area.reduce(function(previous, value) {
            return {x: previous.x + value[0], y: previous.y + value[1]}
          }, {x: 0, y: 0})
          var center = {
            x: (cumulated.x / area.length) | 0,
            y: (cumulated.y / area.length) | 0,
          }
          var radius = Math.max.apply(undefined, (area.map(function(value) {
            return Math.ceil(Caman.Calculate.distance(
              center.x, center.y, value[0], value[1]
            ))
          })))
          return {
            pos: {
              x: center.x,
              y: center.y,
            },
            radius: radius
          }
        })
      }

      return {
        findStars: function(caman) {
          var deferredStars = $q.defer()
          var deferredThreshold = $q.defer()
          caman
            .histogram(deferredThreshold)
            .render(function() {
              // By this time, the promise is resolved,
              // i.e. we need another tick, because
              // registering a then-method doe not short-circuit
              // into direct execution. -_-
              $rootScope.$apply(function() {
                deferredThreshold.promise.then(function(histogram) {
                  var brightnessThreshold = determineThreshold(
                    5, // Percentage of image area, starting with the brightest.
                    128, // Max number of brightest classes to include
                    histogram,
                    caman
                  )
                  console.log("brightness threshold: " + brightnessThreshold)
                  caman.threshold(brightnessThreshold).render(function() {
                    var that = this
                    resolveWithAngular(
                      deferredStars, selectCenterAndRadius(findWhiteAreas(that)))
                  })
                })
              })
            })

          return deferredStars.promise
        }
      }
    }])
