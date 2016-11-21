#!./node_modules/.bin/bats
 
# Remember where we started
BASE_DIR=$(dirname $BATS_TEST_DIRNAME)

# Set up a directory to mess around with
TMP_DIRECTORY=$(mktemp -d)

teardown() {
  if [ $BATS_TEST_COMPLETED ]; then
    echo "Deleting $TMP_DIRECTORY"
    rm -rf $TMP_DIRECTORY
  else
    echo "** Did not delete $TMP_DIRECTORY, as test failed **"
  fi

  cd $BATS_TEST_DIRNAME
}

@test "Should install the Git binary to /tmp/git by default" {  
  run node -e "require('./index.js')()"

  [ "$status" -eq 0 ]
  [ -e "/tmp/git/usr/bin/git" ]
  rm -rf /tmp/git
}

@test "Should install the Git binary to a given directory" {  
  run node -e "require('./index.js')({ targetDirectory: '$TMP_DIRECTORY' })"

  [ "$status" -eq 0 ]
  [ -e "$TMP_DIRECTORY/usr/bin/git" ]
}

@test "Should set the process env by default" {  
  run node -e "require('./index.js')({ targetDirectory: '$TMP_DIRECTORY' }); console.log(process.env)"

  [ "$status" -eq 0 ]
  [[ "$output" = *" PATH: '$TMP_DIRECTORY/usr/bin'"* ]]
  [[ "$output" = *" GIT_TEMPLATE_DIR: '$TMP_DIRECTORY/usr/share/git-core/templates'"* ]]
  [[ "$output" = *" GIT_EXEC_PATH: '$TMP_DIRECTORY/usr/libexec/git-core'"* ]]
}

@test "Should not change the env, if explicitly asked" {
  run node -e "require('./index.js')({ targetDirectory: '$TMP_DIRECTORY', updateEnv: false }); console.log(process.env)"

  [ "$status" -eq 0 ]
  [[ "$output" = *" PATH: '$TMP_DIRECTORY/usr/bin'"* ]]
  [[ "$output" != *" GIT_TEMPLATE_DIR: '$TMP_DIRECTORY/usr/share/git-core/templates'"* ]]
  [[ "$output" != *" GIT_EXEC_PATH: '$TMP_DIRECTORY/usr/libexec/git-core'"* ]]
}

@test "Should return the relevant env vars, if not updating the env" {
  run node -e "console.log(require('./index.js')({ targetDirectory: '$TMP_DIRECTORY', updateEnv: false }))"

  [ "$status" -eq 0 ]
  [[ "$output" = *" binPath: '$TMP_DIRECTORY/usr/bin'"* ]]
  [[ "$output" = *" GIT_TEMPLATE_DIR: '$TMP_DIRECTORY/usr/share/git-core/templates'"* ]]
  [[ "$output" = *" GIT_EXEC_PATH: '$TMP_DIRECTORY/usr/libexec/git-core'"* ]]
}