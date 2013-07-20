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
