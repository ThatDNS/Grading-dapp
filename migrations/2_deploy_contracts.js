// var Election = artifacts.require("./Election.sol");
var Grading = artifacts.require("./Grading.sol");

module.exports = function(deployer) {
  // deployer.deploy(Election);
  deployer.deploy(Grading);
};