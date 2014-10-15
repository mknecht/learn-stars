/*global angular */
'use strict';

/**
 * @ngdoc function
 * @name learnStarsApp.controller:StarmapCtrl
 * @description
 * # StarmapCtrl
 * Controller of the learnStarsApp
 */
angular
  .module('learnStarsApp')
  .controller('StarmapCtrl', [
    '$scope', '$injector',
    function ($scope, $injector) {
      var controller = this
        , $log = $injector.get('$log')
        , $rootScope = $injector.get('$rootScope')
        , $ = $injector.get('jQuery')
        , fabric = $injector.get('fabric')

      var normalColor = 'rgba(1, 1, 1, .1)'
      var hoverColor = 'rgba(200, 50, 0, 100'
      var selectedColor = 'rgba(0, 100, 200, 100'

      this.init = function(element) {
        $log.debug("Initializing star controller with: ", element)

        this.canvas = new fabric.Canvas(element, {
          hoverCursor: 'pointer',
          selection: false,
          perPixelTargetFind: true,
          targetFindTolerance: 5,
        })
        this.canvas.on('mouse:over', function(options) {
          if (options.target.constructor === fabric.Circle) {
            options.target.toggleHovering()
          }
        });

        this.canvas.on('mouse:out', function(options) {
          if (options.target.constructor === fabric.Circle) {
            options.target.toggleHovering()
          }
        })

        this.canvas.on('mouse:up', function(options) {
          if (options.target.constructor === fabric.Circle) {
            options.target.toggleSelection()
          }
        })
      }

      function getScalingFunctionForImage(fimage) {
        return scalePreservingRatio(toDim(fimage.getWidth(), fimage.getHeight()), toDim($(window).width(), $(window).height()))
      }

      $scope.$on('image-uploaded', function(event, data) {
        var image = data.image
        controller.fimage = new fabric.Image(
          image,
          {
            selectable: false
          }
        )
        var scale = getScalingFunctionForImage(controller.fimage)
        controller.canvas.setHeight(scale(controller.fimage.getHeight()))
        controller.canvas.setWidth(scale(controller.fimage.getWidth()))

        return {
          height: controller.fimage.getHeight(),
          width: controller.fimage.getWidth(),
        }
      })

      $scope.$on('found-stars', function(event, data) {
        var stars = data.stars
        $log.debug('Got stars to mark!')
        var scale = getScalingFunctionForImage(controller.fimage)
        controller.fimage.scale(scale(1))
        controller.canvas.add(controller.fimage)
        stars.forEach(function(star) {
          var circle = new fabric.Circle({
            radius: Math.max(6, star.radius + 3),
            left: scale(star.pos.x),
            top: scale(star.pos.y),
            fill: 'transparent',
            originX: 'center',
            originY: 'center',
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
            this.canvas.renderAll()
          }

          circle.scale(scale(1))
          controller.canvas.add(circle)
        })
      })

      function scalePreservingRatio(fromDim, toDim) {
        function scale(it, ratio) {
          return it * ratio
        }

        var xRatio = toDim.width / fromDim.width
        var yRatio = toDim.height / fromDim.height
        var preservingRatio = Math.min(xRatio, yRatio)
        $log.debug("Aspect ratios: x (" + xRatio + "), y (" + yRatio
                  + ") preserving " + preservingRatio)

        return function(n) {
          return scale(n, preservingRatio)
        }
      }

      function toDim(w, h) { return { width: w, height: h } }
    }]);
