var nodemock = require('../lib/nodemock');
var assert = require('assert');

describe('nodemock', function () {
  it('asserts that a function was called', function () {
    var DummyObject, mockDummyObject;

    DummyObject = function () {};
    DummyObject.prototype.testFunction = function () {};

    mockDummyObject = nodemock.mock(DummyObject);

    mockDummyObject.testFunction();

    mockDummyObject.testFunction.should.haveBeenCalled();
  });

  it('asserts that a function was not called', function () {
    var DummyObject, mockDummyObject;

    DummyObject = function () {};
    DummyObject.prototype.testFunction = function () {};

    mockDummyObject = nodemock.mock(DummyObject);

    mockDummyObject.testFunction.should.not.haveBeenCalled();
  });
});
