'use strict';

/**
 * @ngdoc overview
 * @name learnStarsApp
 * @description
 * # learnStarsApp
 *
 * Main module of the application.
 */
angular
  .module('learnStarsApp', [
    'ngAnimate',
    'ngCookies',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'flow'
  ])
  .constant("jQuery", window.$)
  .constant("Caman", window.Caman)
  .constant("fabric", window.fabric)
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
