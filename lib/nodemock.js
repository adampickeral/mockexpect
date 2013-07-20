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
};

nodemock.spyOn = function (object, method) {
  var spy, spyFunction;

  spy = new nodemock.Spy(method);
  if (!object.spies) {
    object.spies = {};
  }
  object.spies[method] = spy;
  spyFunction = nodemock.apply(nodemock.applyFunction, method);
  spyFunction.should = spy;
  object[method] = spyFunction;

  return spy;
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
  return spy.invokeFunction.apply(spy, Array.prototype.slice.call(arguments, 1));
};

nodemock.Spy = function (name, spy) {
  this.name_ = name;

  if (spy) {
    this.callCount_ = spy.callCount_;
    this.calls_ = spy.calls_;
    this.returnValue_ = spy.returnValue_;
    this.negative_ = true;
  } else {
    this.callCount_ = 0;
    this.calls_ = [];
    this.returnValue_ = null;
    this.negative_ = false;
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

nodemock.Spy.prototype.haveBeenCalled = function () {
  this.negative_ ? 
    assert.ok(this.callCount_ === 0, this.name_ + '() was called.') : 
    assert.ok(this.callCount_ > 0, this.name_ + '() was never called.');
};

nodemock.Spy.prototype.haveBeenCalledWith = function () {
  var args;

  args = Array.prototype.slice.call(arguments);
  this.negative_ ? 
    this.negativeCallMatch_.apply(this, arguments) : 
    this.positiveCallMatch_.apply(this, arguments);
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

  return matches;
};

nodemock.Spy.prototype.callCount_ = null;
nodemock.Spy.prototype.calls_ = null;
nodemock.Spy.prototype.name_ = null;
nodemock.Spy.prototype.returnValue_ = null;
nodemock.Spy.prototype.negative_ = null;

nodemock.Spy.not = null;

module.exports = nodemock;
