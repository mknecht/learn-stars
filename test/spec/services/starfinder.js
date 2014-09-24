/*global angular expect inject beforeEach module describe Caman it */
'use strict';

describe('Service: starFinder.findsStars', function () {

  // load the service's module
  beforeEach(module('learnStarsApp'))

  // instantiate service
  var starFinder
  var canvas

  beforeEach(inject(function (_starFinder_) {
               canvas = angular.element('<canvas></canvas>')
               starFinder = _starFinder_
             }))

  it('bw image without bright spots finds nothing', function (done) {
    Caman(canvas[0], "test/images/3x3-bw-0stars.png", function() {
      starFinder
        .findStars(this)
        .then(function(stars) {
          expect(stars.length).toEqual(0)
          done()
      })
    })
  })

  it('bw image with 1 bright spot finds 1 star', function (done) {
    var canvas = angular.element('<canvas></canvas>')
    Caman(canvas[0], "test/images/3x3-bw-1star.png", function() {
      starFinder
        .findStars(this)
        .then(function(stars) {
          expect(stars.length).toEqual(1)
          expect(stars).toEqual([[1, 1]])
          done()
      })
    })
  })

  it('bluish image with 1 bright spot finds 1 star', function (done) {
    var canvas = angular.element('<canvas></canvas>')
    Caman(canvas[0], "test/images/3x3-bluish-1star.png", function() {
      starFinder
        .findStars(this)
        .then(function(stars) {
          expect(stars.length).toEqual(1)
          expect(stars).toEqual([[1, 1]])
          done()
      })
    })
  })

  it('bluish image with 2 bright spots finds 2 stars', function (done) {
    var canvas = angular.element('<canvas></canvas>')
    Caman(canvas[0], "test/images/5x3-bluish-2stars.png", function() {
      starFinder
        .findStars(this)
        .then(function(stars) {
          expect(stars.length).toEqual(2)
          expect(stars).toEqual([[1, 1], [3, 1]])
        done()
      })
    })
  })

  it('bluish image with 1 bright area finds 1 star', function (done) {
    var canvas = angular.element('<canvas></canvas>')
    Caman(canvas[0], "test/images/5x3-bluish-1-big-star.png", function() {
      starFinder
        .findStars(this)
        .then(function(stars) {
          expect(stars.length).toEqual(1)
        done()
      })
    })
  })

  it('bluish image with 2 bright areas finds 2 stars', function (done) {
    var canvas = angular.element('<canvas></canvas>')
    Caman(canvas[0], "test/images/5x3-bluish-2-big-stars.png", function() {
      starFinder
        .findStars(this)
        .then(function(stars) {
          expect(stars.length).toEqual(2)
        done()
      })
    })
  })
})
