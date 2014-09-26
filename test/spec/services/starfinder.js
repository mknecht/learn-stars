/*global angular expect inject beforeEach module describe Caman it jasmine */
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
    Caman.DEBUG = true

    jasmine.addMatchers({
      toContainStarAt: function(util, customEqualityTesters) {
        return {
          compare: function(stars, pos) {
            if (stars.length === 0) {
              return "Did not find any stars at all."
            }
            var closest = stars.reduce(
              function(data, star) {
                var distance = Caman.Calculate.distance(
                  star.pos.x, star.pos.y, pos.x, pos.y)
                if (distance < data.distance) {
                  data.star = star
                  data.match = (distance <= star.radius)
                  data.distance = distance
                }
                return data
              }, {
                star: undefined,
                match: false,
                distance: Number.MAX_VALUE
              }
            )
            var result = {
              pass: closest.match,
            }
            if (!result.pass) {
              var distance = Caman.Calculate.distance(
                pos.x, pos.y, closest.star.pos.x, closest.star.pos.y)
              result.message = (
                "Did not find a star at (" + pos.x + "," + pos.y + ")."
                                + " The closest star is at (" + closest.star.pos.x
                                + "," + closest.star.pos.y + "),"
                                + " which is " + (distance|0) + "px away and "
                                + ((distance - closest.star.radius)|0) + "px too many."
              )
            }
            return result
          }
        }
      }
    })
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
          expect(stars).toEqual([
            {pos: {x:1, y:1}, radius:0}
          ])
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
          expect(stars).toEqual([
            {pos: {x:1, y:1}, radius:0}
          ])
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
          expect(stars).toEqual([
            {pos: {x:1, y:1}, radius:0},
            {pos: {x:3, y:1}, radius:0},
          ])
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

  it('bluish image with 1 bright area finds correct center and radius', function (done) {
    var canvas = angular.element('<canvas></canvas>')
    Caman(canvas[0], "test/images/5x3-bluish-1-big-star.png", function() {
      starFinder
        .findStars(this)
        .then(function(stars) {
          expect(stars).toEqual([
            {pos: {x:2, y:1}, radius:1}
          ])
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

  it('bluish image with 2 bright areas finds correct center and radius', function (done) {
    var canvas = angular.element('<canvas></canvas>')
    Caman(canvas[0], "test/images/5x3-bluish-2-big-stars.png", function() {
      starFinder
        .findStars(this)
        .then(function(stars) {
          expect(stars).toEqual([
            {pos: {x:1, y:1}, radius:0},
            /** This center is somewhat arbitrary, but fixed now. */
            {pos: {x:3, y:1}, radius:1},
          ])
          done()
        })
    })
  })

  it('Big Dipper (Juno) finds all 7 stars', function (done) {
    var canvas = angular.element('<canvas></canvas>')
    Caman(canvas[0], "test/images/big-dipper-juno.jpg", function() {
      starFinder
        .findStars(this)
        .then(function(stars) {
          // Handle
          expect(stars).toContainStarAt({x:67, y:150}) // Alkaid
          expect(stars).toContainStarAt({x:241, y:123}) // Mizar
          expect(stars).toContainStarAt({x:340, y:179}) // Alioth
          // Corners
          expect(stars).toContainStarAt({x:469, y:236}) // Megrez
          expect(stars).toContainStarAt({x:741, y:220}) // Dubhe
          expect(stars).toContainStarAt({x:705, y:360}) // Merak
          expect(stars).toContainStarAt({x:494, y:350}) // Phecda
          // negative test
          expect(stars).not.toContainStarAt({x:571, y:107}) // black space
          done()
        })
    })
  })

  it('Hyades finds prominent stars, but not "noisy" stars', function (done) {
    var canvas = angular.element('<canvas></canvas>')
    Caman(canvas[0], "test/images/hyades.jpg", function() {
      starFinder
        .findStars(this)
        .then(function(stars) {
          // bright star in the middle, lower third
          expect(stars).toContainStarAt({x:907, y:947})
          // bright star left third, middle
          expect(stars).toContainStarAt({x:487, y:675})
          // one of many in upper right corner
          expect(stars).toContainStarAt({x:1894, y:82})
          // a small bluish dot that is far inferior
          // to many, many others.
          // It seems reasonable to want to exclude that one.
         expect(stars).not.toContainStarAt({x:294, y:328})
          // negative test
         expect(stars).not.toContainStarAt({x:1708, y:148})
          // Seems like a reasonable fuzzy test. :)
          // First time I ran it, I got close to 20k stars! :)
          expect(stars.length).toBeGreaterThan(1000)
          done()
        })
    })
  })

})
