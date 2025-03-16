const voter = artifacts.require("voter");

module.exports = function(deployer) {
  deployer.deploy(voter);
};
