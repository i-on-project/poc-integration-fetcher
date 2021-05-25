# Integration Fetcher PoC

Proof of concept to fetch academic data from the integration data repository.

To run the node.js application `yarn` is required:
```sh
# Clone this repository
git clone https://github.com/i-on-project/poc-integration-fetcher

# Go to the repository folder
cd poc-integration-fetcher

# Install the required node modules
yarn install

# Run the application
# The first argument is the URI to the integration data Git repository, the second argument is the institution reverse address and the third argument is the hash of the base commit of the repository, from which changes are going to be detected
yarn start https://github.com/i-on-project/integration-data pt.ipl.isel 42c7598425e21a9eaa68e52339b9452b57f3a740
```

To force the use of the fallback method to run the application (force the use of `libgit2` bindings) you can set the following environment variable before running the application with `yarn`:
```sh
export FETCHER_FORCE_FALLBACK=true
```