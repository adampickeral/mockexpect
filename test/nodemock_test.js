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

  it('asserts that a function was called an exact number of times', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalled(3);

    mockDummyObject.testFunction();
    mockDummyObject.testFunction();
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

  it('fails the assertion when types do not match', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith(new nodemock.Matcher(DummyObject));

    mockDummyObject.testFunction(function () { return 'something happened'; });

    assert.throws(
      mockDummyObject.assertExpectationsHaveBeenMet.bind(mockDummyObject), 
      function (err) {
        return err.message === 'testFunction() was not called with [Matcher(function () {})], but was called with [function () { return \'something happened\'; }]';
      },
      'exception message did not contain call arguments'
    );
  });

  it('asserts that a function was called with a mix of specific and non-specific arguments', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith(new nodemock.Matcher(Function), 'string', { 'a': 'b' });

    mockDummyObject.testFunction(function () { return 'something happened'; }, 'string', { 'a': 'b' });

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was not called with a string', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalledWith('different string');
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith('someString');

    mockDummyObject.testFunction('someString');

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was not called with multiple arguments', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalledWith('someString', 1, 'anotherString');
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith('someString', 5, 'anotherString');
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith('someString');

    mockDummyObject.testFunction('someString');
    mockDummyObject.testFunction('someString', 5, 'anotherString');

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that strict equality is enforced', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalledWith(1);
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith('1');

    mockDummyObject.testFunction('1');

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was not called with an object', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalledWith({ 'a': 'b', 'c': 2 });
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith({ 'a': 'b', 'c': 1, 'd': 2 });

    mockDummyObject.testFunction({ 'a': 'b', 'c': 1, 'd': 2 });

    mockDummyObject.assertExpectationsHaveBeenMet();
  });

  it('asserts that a function was not called with a given type', function () {
    mockDummyObject.testFunction.expect.not.toHaveBeenCalledWith(new nodemock.Matcher(DummyObject));
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith(new nodemock.Matcher(Function));

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
      function (err) {
        return err.message === 'secondTestFunction() was called without an expectation being set.';
      },
      'exception was not thrown'
    );
  });

  it('shows the actual calls for a function when an expectation is not met', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith('this string', 5, 'another string');
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith('weird string');
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith('that string', 5, 'another string');

    mockDummyObject.testFunction('that string', 5, 'another string');
    mockDummyObject.testFunction('weird string');

    assert.throws(
      mockDummyObject.assertExpectationsHaveBeenMet.bind(mockDummyObject), 
      function (err) {
        return err.message === 'testFunction() was not called with [this string, 5, another string], but was called with [that string, 5, another string], [weird string]';
      },
      'exception message did not contain call arguments'
    );
  });

  it('shows the actual and expected call count in failure message when there are no calls', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalled();

    assert.throws(
      mockDummyObject.assertExpectationsHaveBeenMet.bind(mockDummyObject), 
      function (err) {
        return err.message === 'expected testFunction() to have been called 1 time but it was never called.';
      },
      'call count exception message is not correct'
    );
  });

  it('shows the actual and expected call count in failure message when there is one call', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalled(2);

    mockDummyObject.testFunction();

    assert.throws(
      mockDummyObject.assertExpectationsHaveBeenMet.bind(mockDummyObject), 
      function (err) {
        return err.message === 'expected testFunction() to have been called 2 times but it was called 1 time.';
      },
      'call count exception message is not correct'
    );
  });

  it('shows the actual and expected call count in failure message when there are multiple calls', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalled(3);

    mockDummyObject.testFunction();
    mockDummyObject.testFunction();

    assert.throws(
      mockDummyObject.assertExpectationsHaveBeenMet.bind(mockDummyObject),
      function (err) {
        return err.message === 'expected testFunction() to have been called 3 times but it was called 2 times.';
      },
      'call count exception message is not correct'
    );
  });

  it('shows the fields of an object in a failure message', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith({'a': 'something', 'b': new nodemock.Matcher(Function)});
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith({3: new nodemock.Matcher(Function), 'z': 'something else'});

    mockDummyObject.testFunction({3: function () {}, 'z': 'something else'});
    mockDummyObject.testFunction({'a': 'different thing', 'b': function () {}});

    assert.throws(
      mockDummyObject.assertExpectationsHaveBeenMet.bind(mockDummyObject),
      function (err) {
        return err.message === 'testFunction() was not called with [{ a: something, b: Matcher(function Function() { [native code] }) }], but was called with [{ 3: function () {}, z: something else }], [{ a: different thing, b: function () {} }]';
      },
      'exception message did not contain call arguments'
    );
  });

  it('deep equality on object matching', function () {
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith({'a': 'something', 'b': 'something else'});

    mockDummyObject.testFunction({'a': 'something', 'b': 'something else', 'c': 'another thing'});

    assert.throws(
      mockDummyObject.assertExpectationsHaveBeenMet.bind(mockDummyObject),
      function (err) {
        return err.message === 'testFunction() was not called with [{ a: something, b: something else }], but was called with [{ a: something, b: something else, c: another thing }]';
      },
      'exception message did not contain call arguments'
    );
  });
});
