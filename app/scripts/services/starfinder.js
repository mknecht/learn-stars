'use strict';

/**
 * @ngdoc service
 * @name learnStarsApp.starFinder
 * @description
 * # starFinder
 * Factory in the learnStarsApp.
 */
angular.module('learnStarsApp')
       .factory('starFinder', function () {

  var brightnessThreshold = 50

  // http://www.w3.org/TR/AERT#color-contrast
  function calcBrightness(r, g, b, a) {
    return (
      (
        r * 299
      + g * 587
      + b * 114
      ) / 1000
    )
  }

  function applyThreshold(original, threshold) {
      var i
      var colorCounter = 0

      for (i = 0; i < original.width * original.height * 4; i += 4) {
        var brightness = calcBrightness(
          original.data[i + 0],
          original.data[i + 1],
          original.data[i + 2],
          original.data[i + 3]
        )

        colorCounter += (brightness > threshold) ? 1 : 0
        var color = (brightness > threshold) ? 255 : 0

        original.data[i + 0] = color
        original.data[i + 1] = color
        original.data[i + 2] = color
        original.data[i + 3] = 255
      }
    }


  return {
    findStars: function(imageData) {
      return [[1,1]]
      applyThreshold(imageData, brightnessThreshold)
      return findCenters(findConnectedWhiteAreas(imageData))
    }
  }
})
