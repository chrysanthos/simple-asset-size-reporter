## Simple Asset Size Reporter

This action will calculate the size of your assets for each PR and comment when the filesize is bigger than the one in the master branch.

The defaults are set so that most projects work out of the box (e.g. Laravel projects) but it is easily tweaked to work with any web framework.
### Example usage

Create a file named `.github/workflows/simple-size-check.yml` in your repo and add the following:

```yaml
name: Simple Asset Size Reporter

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2-beta
      with:
        fetch-depth: 0
    - uses: chrysanthos/simple-asset-size-reporter@1.0.0
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        files: '["public/js/*.js", "public/css/*.css"]'
        with-same: 'false'
        build-assets: 'false'
```

### Usage
#####repo-token (Required)
The github token to be used.

####files (Optional)
The asset files to be checked. This needs to be a json encoded array of regex paths.

**Default:** '["public/js/*.js", "public/css/*.css"]'. 

####build-assets (Optional)
In case you do not commit the compiled assets inside your repository and need compiling this the place to put your build command.
When this is set to `auto` it will detect whether you use `npm` or `yarn` and run the appropriate command (i.e. `npm run prod` or `yarn run prod`) to build your assets.

####with-same (Optional)
If you want the report to include the files that their size did not change set this to 'true'.

### Full example
```yaml
name: Simple Asset Size Reporter

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2-beta
      with:
        fetch-depth: 0
    - uses: chrysanthos/simple-asset-size-reporter@1.0.0
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        files: '["public/js/*.js", "public/css/*.css"]'
        with-same: 'true'
        build-assets: 'npm run prod'
```

### Credits
Initial work: [simplabs/ember-asset-size-action](https://github.com/simplabs/ember-asset-size-action)
