/*global angular expect inject beforeEach module describe */
'use strict';

describe('Service: starFinder', function () {

  // load the service's module
  beforeEach(module('learnStarsApp'))

  // instantiate service
  var starFinder

  beforeEach(inject(function (_starFinder_) {
               starFinder = _starFinder_
             }))

  it('3x3 image with 1 star', function (done) {
    var canvas = angular.element('<canvas></canvas>')
    Caman(canvas[0], "test/images/3x3-bw-1star.png", function() {
      expect(starFinder.findStars(this)).toEqual([[1, 1]])
      done()
    })
  })
})
