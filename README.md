## Simple Asset Size Reporter

This action will calculate the size of your assets for each PR and comment when the filesize is bigger than the one in the master branch.

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
    - uses: chrysanthos/simple-asset-size-reporter@v1
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

### Credits
Initial work: [simplabs/ember-asset-size-action](https://github.com/simplabs/ember-asset-size-action)
