MockExpect
========
[![Build Status](https://travis-ci.org/adampickeral/mockexpect.png?branch=master)](https://travis-ci.org/adampickeral/mockexpect)

Mocking Libray with Strict Expectations for NodeJS

MockExpect allows you to set strict expectations on your test dependencies. What that means is that you can assert that your dependencies will not have any unexpected behavior in your production code.

You can create mocks in 2 different ways with MockExpect. You can simply spy on a function, as most mocking libraries allow you to do, or you can spy on a constructor function (one that is meant to be invoked with new). When you spy on a constructor function, all of the functions defined on the object's prototype will be spied on. This helps to ensure you adhere to the contract of the "type" of your dependencies without having to build out fake objects in test code that match your dependencies.

Examples
---------
### Include the module
    var mockexpect = require('mockexpect');

### Set Expectations
    var DummyObject = function () {};
    DummyObject.prototype.testFunction = function () {};
    
    var mockDummyObject = mockexpect.mock(DummyObject);
    
    mockDummyObject.testFunction.expect.toHaveBeenCalled();
    
    mockDummyObject.testFunction();
    
    mockDummyObject.assertExpectations();

If you were to invoke `testFunction()` in your code without setting an expectation, your tests would fail for not having an expectation set. To have been called also takes an optional call count parameter, so you can expect an exact number of calls (the default is 1).
    
    mockDummyObject.testFunction.expect.toHaveBeenCalled(3);

### Expectations with Arguments
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith('a', 3);

### Expectations with Matchers
    mockDummyObject.testFunction.expect.toHaveBeenCalledWith(new mockexpect.Matcher(Function));
    
    mockDummyObject.testFunction(function() {});

### Invoking functions from mocked functions
    mockDummyObject.testFunction.expect.toHaveBeenCalled().andCall(function () {});

### Return value from mocked functions
    mockDummyObject.testFunction.expect.toHaveBeenCalled().andReturn('some value');

### Mock an individual function
    DummyObject.someFunction = function () {};
    
    mockexpect.spyOn(DummyObject, 'someFunction');
    // set expectations the same way we do it above
