# lambda-git
A git binary installed through NPM, for use with AWS Lambda

To use this, just require it, and call it. E.g:

```javascript
require("lambda-git")();
```

After you've made this call, your Node process will be set up to run Git as a subprocess. This extracts a lambda-built version of Git, updates the required environment variables to make it functional, and updates your process.env.PATH to make it accessible.

If you want to do something more complicated, you can provide options to change this behaviour.

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