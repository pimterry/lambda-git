# lambda-git
## [@lambda-git](https://www.npmjs.com/package/lambda-git)
A git binary installed through NPM, for use with AWS Lambda.

_**Deprecated: this module isn't supported on AWS Linux 2 - you probably want to use [git-lambda-layer](https://github.com/lambci/git-lambda-layer) instead. See https://github.com/pimterry/lambda-git/issues/14 for further context.**_

To use this, just require it, and call it.

```javascript
require("lambda-git")();
```

This call returns a Promise, and once it completes your Node process will be set up to run Git as a subprocess. `lambda-git` extracts a Lambda-built version of Git, updates the required environment variables to make it functional, and updates your process.env.PATH to make it accessible.

A larger example:

```javascript
const { exec } = require('child_process');

require("lambda-git")()
	.then(function () {
		// git is now ready
        exec("git --version");
	})
	.catch(function (error) {
		// something failed
	});
```

If you want to do something more complicated, you can provide options to change this behaviour.

The Git binary itself comes from [LambCI](https://github.com/lambci/lambci/tree/master/vendor).


## Changing the installation path:

```javascript
require("lambda-git")({
    targetDirectory: "/tmp/alternate/path/git"
});
```


## Managing env vars yourself:

```javascript
require("lambda-git")({
    updateEnv: false
});
/* Returns:
{
    binPath: "/tmp/git/usr/bin",
    env: {
        GIT_TEMPLATE_DIR: '/tmp/git/usr/share/git-core/templates',
        GIT_EXEC_PATH: '/tmp/git/usr/libexec/git-core'
    }
} */
```

You'll need to extract these values and ensure they're made available to whatever process you're using to run Git.
