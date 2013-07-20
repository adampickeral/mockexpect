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

  it('asserts that a function was called with a string', function () {
    var DummyObject, mockDummyObject;

    DummyObject = function () {};
    DummyObject.prototype.testFunction = function () {};

    mockDummyObject = nodemock.mock(DummyObject);

    mockDummyObject.testFunction('someString');

    mockDummyObject.testFunction.should.haveBeenCalledWith('someString');
  });

  it('asserts that a function was called with multiple arguments', function () {
    var DummyObject, mockDummyObject;

    DummyObject = function () {};
    DummyObject.prototype.testFunction = function () {};

    mockDummyObject = nodemock.mock(DummyObject);

    mockDummyObject.testFunction('someString', 'anotherString', 3);

    mockDummyObject.testFunction.should.haveBeenCalledWith('someString', 'anotherString', 3);
  });

  it('asserts that a function was not called with a string', function () {
    var DummyObject, mockDummyObject;

    DummyObject = function () {};
    DummyObject.prototype.testFunction = function () {};

    mockDummyObject = nodemock.mock(DummyObject);

    mockDummyObject.testFunction('someString');

    mockDummyObject.testFunction.should.not.haveBeenCalledWith('different string');
  });

  it('asserts that a function was not called with multiple arguments', function () {
    var DummyObject, mockDummyObject;

    DummyObject = function () {};
    DummyObject.prototype.testFunction = function () {};

    mockDummyObject = nodemock.mock(DummyObject);

    mockDummyObject.testFunction('someString');
    mockDummyObject.testFunction('someString', 5, 'anotherString');

    mockDummyObject.testFunction.should.not.haveBeenCalledWith('someString', 1, 'anotherString');
  });
});
