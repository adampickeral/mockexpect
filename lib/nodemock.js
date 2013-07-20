var assert = require('assert');

var nodemock = function () {};

nodemock.mock = function (objectType) {
  var mockedObject;

  mockedObject = new objectType();
  nodemock.mockObject(mockedObject);

  return mockedObject;
};

nodemock.mockObject = function (object) {
  for (var method in object) {
    nodemock.spyOn(object, method);
  }
  object.assertExpectationsHaveBeenMet = nodemock.assertExpectations.bind(null, object);
};

nodemock.spyOn = function (object, method, clear) {
  var spy, spyFunction;

  spy = new nodemock.Spy(method);
  if (!object.spies) {
    object.spies = {};
  }
  if (clear) {
    object.spies = {};
    object.calls_ = [];
    if (object.not) {
      object.not = new nodeMock.Spy(method, this);
    }
  }
  object.spies[method] = spy;
  spyFunction = nodemock.apply(nodemock.applyFunction, method);
  spyFunction.expect = spy;
  object[method] = spyFunction;

  if (!object.assertExpectationsHaveBeenMet) {
    object.assertExpectationsHaveBeenMet = nodemock.assertExpectations.bind(null, object);
  }

  return spy;
};

nodemock.assertExpectations = function (object) {
  var expectationsMet;

  expectationsMet = true;

  for (var spy in object.spies) {
    expectationsMet = expectationsMet && object.spies[spy].assertExpectationsHaveBeenMet();
  }

  assert.ok(expectationsMet, 'Not all expectations were met');
};

nodemock.apply = function (fn, method) {
  var args;

  args = Array.prototype.slice.call(arguments, 1);
  return function () {
    var newArgs;

    newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return nodemock.applyFunction.apply(this, newArgs);
  }
};

nodemock.applyFunction = function () {
  var spy, args;

  args = Array.prototype.slice.call(arguments);
  spy = this.spies[args[0]];
  if (spy.isExpectationSet()) {
    return spy.invokeFunction.apply(spy, Array.prototype.slice.call(arguments, 1));
  } else {
    throw new assert.AssertionError({
      message: spy.getName() + '() was called without an expectation being set.'
    });
  }
};

nodemock.Spy = function (name, spy) {
  this.name_ = name;

  if (spy) {
    this.calls_ = spy.calls_;
    this.returnValue_ = spy.returnValue_;
    this.expectations_ = [];
    this.negative_ = true;
  } else {
    this.calls_ = [];
    this.returnValue_ = null;
    this.negative_ = false;
    this.expectations_ = [];
    this.not = new nodemock.Spy(name, this);
  }

  return this;
};

nodemock.Spy.prototype.invokeFunction = function () {
  var args;

  args = Array.prototype.slice.call(arguments)
  this.calls_.push(args);
  if (this.functionToCall_) {
    this.functionToCall_.apply(null, args);
  } else {
    return this.returnValue_;
  }
};

nodemock.Spy.prototype.andCall = function (functionToCall) {
  this.functionToCall_ = functionToCall;
};

nodemock.Spy.prototype.isExpectationSet = function () {
  var expectationsSet;

  expectationsSet = this.expectations_.length > 0;

  if (this.not) {
    expectationsSet = expectationsSet || this.not.isExpectationSet();
  }
  return expectationsSet;
};

nodemock.Spy.prototype.assertExpectationsHaveBeenMet = function () {
  var expectationsLength, expectedCallCount;

  expectationsLength = this.expectations_.length;
  expectedCallCount = 0;
  for (var i = 0; i < expectationsLength; i++) {
    this.expectations_[i].assertion.apply(this);
    expectedCallCount += this.expectations_[i].expectedCallCount;
  }
  if (this.not) {
    this.assertNumberOfCalls_(expectedCallCount);
    return this.not.assertExpectationsHaveBeenMet();
  }
  
  return true;
};

nodemock.Spy.prototype.assertNumberOfCalls_ = function (expectedCallCount) {
  // assert.strictEqual(this.calls_.length, expectedCallCount, 'Not all calls have expectations set.');
};

nodemock.Spy.prototype.toHaveBeenCalled = function (numberOfCalls) {
  var expectedCallCount;

  expectedCallCount = numberOfCalls || 1;
  this.expectations_.push({
    assertion: function () {
                 this.negative_ ? 
                   assert.ok(this.calls_.length != expectedCallCount, this.name_ + '() was called.') : 
                   assert.ok(this.calls_.length === expectedCallCount, this.callCountFailureMessage_(expectedCallCount));
               }.bind(this),
    expectedCallCount: expectedCallCount
  });
  return this;
};

nodemock.Spy.prototype.callCountFailureMessage_ = function (expectedCallCount) {
  var message, callsLength;

  message = 'expected ' + this.name_ + '() to have been called ' + expectedCallCount;

  if (expectedCallCount > 1) {
    message += ' times';
  } else {
    message += ' time'
  }

  message += ' but it was ';

  callsLength = this.calls_.length;
  if (callsLength > 0) {
    if (callsLength > 1) {
      message += 'called ' + callsLength + ' times.';
    } else {
      message += 'called 1 time.';
    }
  } else {
    message += 'never called.';
  }
  return message;
};

nodemock.Spy.prototype.toHaveBeenCalledWith = function () {
  var args;

  args = Array.prototype.slice.call(arguments);
  this.expectations_.push({
    assertion: function () {
                 this.negative_ ? 
                 this.negativeCallMatch_.apply(this, args) : 
                 this.positiveCallMatch_.apply(this, args);
               }.bind(this),
    expectedCallCount: 1
  });
};

nodemock.Spy.prototype.andReturn = function (returnValue) {
  this.returnValue_ = returnValue;
};

nodemock.Spy.prototype.positiveCallMatch_ = function () {
  var args;

  args = Array.prototype.slice.call(arguments);

  assert.ok(
    this.calledWithArguments_.apply(this, arguments),
    this.calledWithFailureMessage_(args) 
  );
};

nodemock.Spy.prototype.calledWithFailureMessage_ = function (args) {
  var callsLength, actualCallArguments, previousCall;

  actualCallArguments = '';

  callsLength = this.calls_.length;
  previousCall = false;

  for (var i = 0; i < callsLength; i++) {
    if (previousCall) {
      actualCallArguments += ', ';
    }
    actualCallArguments += '[';
    actualCallArguments += this.argumentsString_(this.calls_[i]);
    actualCallArguments += ']';
    previousCall = true;
  }

  return this.name_ + '() was not called with [' + this.argumentsString_(args) + '], but was called with ' + actualCallArguments;
};

nodemock.Spy.prototype.argumentsString_ = function (args) {
  var message, argsLength, previousArgument;

  message = '';
  argsLength = args.length;
  previousArgument = false;
  for (var i = 0; i < args.length; i++) {
    if (previousArgument) {
      message += ', ';
    }
    if (args[i] instanceof nodemock.Matcher) {
      message += args[i].toString();
    } else if (args[i] instanceof Function) {
      message += args[i];
    } else if (args[i] instanceof Object) {
      message += this.objectToString_(args[i]);
    } else {
      message += args[i];
    }
    previousArgument = true;
  }
  return message;
};

nodemock.Spy.prototype.objectToString_ = function (object) {
  var message, previousKey;

  message = '{ ';
  previousKey = false;
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      if (previousKey) {
        message += ', ';
      }
      message += key + ': ' + object[key];
      previousKey = true;
    }
  }
  message += ' }';
  return message;
};

nodemock.Spy.prototype.negativeCallMatch_ = function () {
  var args;

  args = Array.prototype.slice.call(arguments);

  assert.ok(
    !this.calledWithArguments_.apply(this, arguments), 
    this.name_ + '() was called with ' + args + '.'
  );
};

nodemock.Spy.prototype.calledWithArguments_ = function () {
  var args, argumentsLength, callsLength, argumentsMatch;

  args = Array.prototype.slice.call(arguments);
  argumentsLength = args.length;

  callsLength = this.calls_.length;

  for (var i = 0; i < callsLength; i++) {
    var callArguments, callArgsLength;

    callArguments = this.calls_[i];
    callArgsLength = callArguments.length;
    argumentsMatch = argumentsLength === callArgsLength;
    if (argumentsMatch) {
      for (var l = 0; l < callArgsLength; l++) {
        argumentsMatch = argumentsMatch && this.matches_(args[l], callArguments[l]);
      }
    }

    if (argumentsMatch) {
      return true;
    }
  }

  return false;
};

nodemock.Spy.prototype.matches_ = function (object1, object2) {
  var matches;

  matches = object1 === object2;

  if (!matches) {
    if (object1 instanceof nodemock.Matcher) {
      return object1.matches(object2);
    } else {
      return new nodemock.ObjectMatcher(object1).matches(object2);
    }
  }

  return matches;
};

nodemock.Spy.prototype.getName = function () {
  return this.name_;
};

nodemock.Spy.prototype.calls_ = null;
nodemock.Spy.prototype.name_ = null;
nodemock.Spy.prototype.returnValue_ = null;
nodemock.Spy.prototype.negative_ = null;
nodemock.Spy.prototype.expectations_ = null;
nodemock.Spy.prototype.functionToCall_ = null;

nodemock.Spy.not = null;

nodemock.Matcher = function (clazz) {
  this.clazz_ = clazz;
};

nodemock.Matcher.prototype.matches = function (object) {
  return object instanceof this.clazz_;
};

nodemock.Matcher.prototype.toString = function () {
  return 'Matcher(' + this.clazz_ + ')';
};

nodemock.Matcher.prototype.clazz_ = null;

nodemock.ObjectMatcher = function (object) {
  this.object_ = object;
};

nodemock.ObjectMatcher.prototype.matches = function (object) {
  var objectsMatch;

  objectsMatch = (object instanceof Object) && (this.object_ instanceof Object);
  if (objectsMatch) {
    objectsMatch = objectsMatch && (Object.keys(this.object_).length === Object.keys(object).length);
    for (var key in this.object_) {
      if (this.object_.hasOwnProperty(key)) {
        if (this.object_[key] instanceof nodemock.Matcher) {
          objectsMatch = objectsMatch && this.object_[key].matches(object[key]);
        } else {
          objectsMatch = objectsMatch && (this.object_[key] === object[key]);
        }
      }
    }
  }
  return objectsMatch;
};

nodemock.ObjectMatcher.prototype.object_ = null;

module.exports = nodemock;
