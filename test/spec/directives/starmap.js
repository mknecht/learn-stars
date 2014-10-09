'use strict';

describe('Directive: starmap', function () {

  // load the directive's module
  beforeEach(module('learnStarsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<starmap></starmap>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the starmap directive');
  }));
});
