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

nodemock.spyOn = function (object, method) {
  var spy, spyFunction;

  spy = new nodemock.Spy(method);
  if (!object.spies) {
    object.spies = {};
  }
  object.spies[method] = spy;
  spyFunction = nodemock.apply(nodemock.applyFunction, method);
  spyFunction.expect = spy;
  object[method] = spyFunction;

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
    this.callCount_ = spy.callCount_;
    this.calls_ = spy.calls_;
    this.returnValue_ = spy.returnValue_;
    this.expectationSet_ = spy.expectationSet_;
    this.expectations_ = [];
    this.negative_ = true;
  } else {
    this.callCount_ = 0;
    this.calls_ = [];
    this.returnValue_ = null;
    this.negative_ = false;
    this.expectationSet_ = false;
    this.expectations_ = [];
    this.not = new nodemock.Spy(name, this);
  }

  return this;
};

nodemock.Spy.prototype.invokeFunction = function () {
  this.callCount_ += 1;
  this.not.callCount_ += 1;
  this.calls_.push(Array.prototype.slice.call(arguments));
  return this.returnValue_;
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
  var expectationsLength;

  expectationsLength = this.expectations_.length;
  for (var i = 0; i < expectationsLength; i++) {
    this.expectations_[i].apply(this);
  }
  if (this.not) {
    return this.not.assertExpectationsHaveBeenMet();
  }
  return true;
};

nodemock.Spy.prototype.toHaveBeenCalled = function () {
  this.expectations_.push(function () {
    this.negative_ ? 
      assert.ok(this.callCount_ === 0, this.name_ + '() was called.') : 
      assert.ok(this.callCount_ > 0, this.name_ + '() was never called.');
  }.bind(this));
};

nodemock.Spy.prototype.toHaveBeenCalledWith = function () {
  var args;

  args = Array.prototype.slice.call(arguments);
  this.expectations_.push(function () {
    this.negative_ ? 
    this.negativeCallMatch_.apply(this, args) : 
    this.positiveCallMatch_.apply(this, args);
  }.bind(this));
};

nodemock.Spy.prototype.return = function (returnValue) {
  this.returnValue_ = returnValue;
};

nodemock.Spy.prototype.positiveCallMatch_ = function () {
  var args;

  args = Array.prototype.slice.call(arguments);

  assert.ok(
    this.calledWithArguments_.apply(this, arguments), 
    this.name_ + '() was not called with ' + args + '.'
  );
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

nodemock.Spy.prototype.callCount_ = null;
nodemock.Spy.prototype.calls_ = null;
nodemock.Spy.prototype.name_ = null;
nodemock.Spy.prototype.returnValue_ = null;
nodemock.Spy.prototype.negative_ = null;
nodemock.Spy.prototype.expectationSet_ = null;
nodemock.Spy.prototype.expectations_ = null;

nodemock.Spy.not = null;

nodemock.Matcher = function (clazz) {
  this.clazz_ = clazz;
};

nodemock.Matcher.prototype.matches = function (object) {
  return object instanceof this.clazz_;
};

nodemock.Matcher.prototype.clazz_ = null;

nodemock.ObjectMatcher = function (object) {
  this.object_ = object;
};

nodemock.ObjectMatcher.prototype.matches = function (object) {
  var objectsMatch;

  objectsMatch = (object instanceof Object) && (this.object_ instanceof Object);
  for (var key in this.object_) {
    if (object.hasOwnProperty(key)) {
      objectsMatch = objectsMatch && (this.object_[key] === object[key]);
    }
  }
  return objectsMatch;
};

nodemock.ObjectMatcher.prototype.object_ = null;

module.exports = nodemock;
