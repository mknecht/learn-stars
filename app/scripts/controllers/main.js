/*global angular */

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
    ['$scope', '$compile', 'jQuery', 'starFinder', 'Caman', 'fabric',
      function ($scope, $compile, $, starFinder, Caman, fabric) {
        var $img = angular.element('<img/>')

        $scope.addingFile = function($file) {
          var fileReader = new FileReader();
          fileReader.readAsDataURL($file.file);
          fileReader.onload = function (event) {
            var canvas = new fabric.Canvas('fabric-canvas', {
              hoverCursor: 'pointer',
              selection: false,
              perPixelTargetFind: true,
              targetFindTolerance: 5,
            })
            var image = new Image()
            image.src = event.target.result
            var fimage = new fabric.Image(
              image,
              {
                selectable: false
              }
            )

            var normalColor = 'rgba(1, 1, 1, .1)'
            var hoverColor = 'rgba(200, 50, 0, 100'
            var selectedColor = 'rgba(0, 100, 200, 100'

            canvas.on('mouse:over', function(options) {
              if (options.target.constructor === fabric.Circle) {
                options.target.toggleHovering()
              }
            });

            canvas.on('mouse:out', function(options) {
              if (options.target.constructor === fabric.Circle) {
                options.target.toggleHovering()
              }
            })

            canvas.on('mouse:up', function(options) {
              if (options.target.constructor === fabric.Circle) {
                options.target.toggleSelection()
              }
            })

            canvas.add(fimage)
            var $camanCanvas = $('canvas#caman-canvas')
            $camanCanvas.attr('height', fimage.getHeight())
            $camanCanvas.attr('width', fimage.getWidth())
            var context = $camanCanvas[0].getContext("2d")
            context.drawImage(image, 0, 0)
            canvas.setHeight(fimage.getHeight())
            canvas.setWidth(fimage.getWidth())
            Caman($camanCanvas[0], function() {
              var starsPromise = starFinder.findStars(this)
              starsPromise.then(function(stars) {
                console.log("Found " + stars.length + " stars.")
                canvas.add(fimage);
                stars.forEach(function(star) {
                  var circle = new fabric.Circle({
                    left: star.pos.x,
                    top: star.pos.y,
                    radius: Math.max(6, star.radius + 3),
                    fill: 'transparent',
                    originX: "center",
                    originY: "center",
                    stroke: normalColor,
                    strokeWidth: 2,
                    selectable: false,
                  })
                  circle.originalRadius = circle.radius
                  circle.toggleSelection = function() {
                    this.isSelected = !this.isSelected
                    this.updateColor()
                  }
                  circle.toggleHovering = function() {
                    this.isHoveredOn = !this.isHoveredOn
                    this.updateColor()
                  }
                  circle.updateColor = function() {
                    this.set('stroke', this.isHoveredOn ? hoverColor : (this.isSelected ? selectedColor : normalColor))
                    canvas.renderAll()
                  }

                  canvas.add(circle)
                })
              })
            })
          };
        }
        $scope.debug = false
      }
    ]
  )