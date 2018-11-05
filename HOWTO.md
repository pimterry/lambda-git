# Maintainers How-To

## Updating to a different git version

If a new git version is available, perform these steps to update `lambda-git`:

- Replace the current git tarfile (e.g. `git-2.14.5.tar`) with the new git tarfile.
- Change `gulpfile.js` constant `GIT_FILENAME` to reflect the name of the new git file.
- Use the command `npm run prepublishOnly` to stage the new binaries and check that they are working.

## Adding new code

In order to [avoid publishing unnecessary files](https://blog.npmjs.org/post/165769683050/publishing-what-you-mean-to-publish), `lambda-git` uses the package.json `files` section to identify which files will be added to the npm module.

Please update that section with any new files you need to include when publishing.
