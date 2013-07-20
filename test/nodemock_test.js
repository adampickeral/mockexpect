var nodemock = require('../lib/nodemock');
var assert = require('assert');

describe('nodemock', function () {
  var DummyObject, mockDummyObject;

  beforeEach(function () {
    DummyObject = function () {};
    DummyObject.prototype.testFunction = function () {};
    DummyObject.prototype.secondTestFunction = function () {};

    mockDummyObject = nodemock.mock(DummyObject);
  });

  it('asserts that a function was called', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalled();

    mockDummyObject.testFunction();

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('all functions are spied on', function () {
    mockDummyObject.secondTestFunction.expect.toHaveBeenCalled();

    mockDummyObject.secondTestFunction();

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was not called', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalled();

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was called with a string', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith('someString');

    mockDummyObject.testFunction('someString');

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was called with multiple arguments', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith('someString', 'anotherString', 3);

    mockDummyObject.testFunction('someString', 'anotherString', 3);

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was called with an object', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith({ 'a': 'b', 'c': 1 });

    mockDummyObject.testFunction({ 'a': 'b', 'c': 1 });

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was called with a given type', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith(new nodemock.Matcher(Function));

    mockDummyObject.testFunction(function () { return 'something happened'; });

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was called with a mix of specific and non-specific arguments', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith(new nodemock.Matcher(Function), 'string', { 'a': 'b' });

    mockDummyObject.testFunction(function () { return 'something happened'; }, 'string', { 'a': 'b' });

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was not called with a string', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalledWith('different string');

    mockDummyObject.testFunction('someString');

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was not called with multiple arguments', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalledWith('someString', 1, 'anotherString');

    mockDummyObject.testFunction('someString');
    mockDummyObject.testFunction('someString', 5, 'anotherString');

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that strict equality is enforced', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalledWith(1);

    mockDummyObject.testFunction('1');

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was not called with an object', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalledWith({ 'a': 'b', 'c': 2 });

    mockDummyObject.testFunction({ 'a': 'b', 'c': 1, 'd': 2 });

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was not called with a given type', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalledWith(new nodemock.Matcher(DummyObject));

    mockDummyObject.testFunction(function () { return 'something happened'; });

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('return the specified value', function () {
    mockDummyObject.testFunction.expect.return(5);
    mockDummyObject.testFunction.expect.toHaveBeenCalled();

    assert.strictEqual(mockDummyObject.testFunction(), 5);
  });

  it('fails when a function is called without an expectation being set', function () {
    assert.throws(
      mockDummyObject.secondTestFunction.bind(mockDummyObject), 
      'secondTestFunction() was called without an expectation being set.'
    );
  });
});
