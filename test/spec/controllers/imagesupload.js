'use strict';

describe('Controller: ImagesuploadCtrl', function () {

  // load the controller's module
  beforeEach(module('learnStarsApp'));

  var ImagesuploadCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ImagesuploadCtrl = $controller('ImagesuploadCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
