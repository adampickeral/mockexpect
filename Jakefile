desc('Default Task');
task('default', ['test'], function () {
  complete();
});

desc('Run Tests');
task('test', function () {
	jake.exec(
    'mocha -c --recursive', 
    function () {
      console.log('Tests finished.');
      complete();
    },
    { printStdout: true, printStderr: true }
  );
});

desc('Demo Tests');
task('demo', function () {
  jake.exec(
    "mocha test/demo_test.js -c", 
    function () {
      console.log('Tests finished.');
      complete();
    },
    { printStdout: true, printStderr: true }
  );
});
