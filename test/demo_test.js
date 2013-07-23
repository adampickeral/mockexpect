var DemoObject = require('./demo_object');
var mockexpect = require('../lib/mockexpect');
var assert = require('assert');

describe('DemoObject', function () {
  var mockDemoObject;

  beforeEach(function () {
    mockDemoObject = mockexpect.mock(DemoObject);
  });

  it('asserts the test function is called', function () {
    mockDemoObject.testFunction.expect.toHaveBeenCalled();
    mockDemoObject.anotherTestFunction.expect.toHaveBeenCalled();

    mockDemoObject.testFunction();
    mockDemoObject.anotherTestFunction();

    mockDemoObject.assertExpectations();
  });

  it('can assert that functions were not called', function () {
    mockDemoObject.testFunction.expect.not.toHaveBeenCalled();

    // mockDemoObject.testFunction();

    mockDemoObject.assertExpectations();
  });

  it('asserts the test function is called with arguments', function () {
    mockDemoObject.testFunction.expect.toHaveBeenCalledWith('some variable', { 'a': 'b' }, new mockexpect.Matcher(Function));

    mockDemoObject.testFunction('some variable', { 'a': 'b' }, function () {'something happens'});

    mockDemoObject.assertExpectations();
  });

  it('can also return values', function () {
    mockDemoObject.testFunction.expect.toHaveBeenCalled().andReturn('some return value');

    assert.strictEqual(mockDemoObject.testFunction(), 'some return value', 'values do not match');
  });

  it('can invoke functions too!', function () {
    var functionInvoked;

    functionInvoked = false;

    mockDemoObject.testFunction.expect.toHaveBeenCalled().andCall(function () { functionInvoked = true; });

    mockDemoObject.testFunction();

    assert.ok(functionInvoked, 'function was not invoked');
  });
});
