'use strict';

describe('Service: starFinder', function () {

  // load the service's module
  beforeEach(module('learnStarsApp'));

  // instantiate service
  var starFinder;
  beforeEach(inject(function (_starFinder_) {
    starFinder = _starFinder_;
  }));

  it('should do something', function () {
    expect(!!starFinder).toBe(true);
  });

});
