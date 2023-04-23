# ERC20Permit

This hardhat project demonstrates the following:
-Signing a arbitrary typed data message in ethers
-Verifying a signed message in ethers
-A Token Owner sending ERC20 to a Token Receiver without spending gas
-Implementing a 3rd party paymaster to sponsor transactions
-Utilize the permit() method of ERC20Permit to verify a token owner's signature and increase their token allowance

To understand how this works, first run the tests, then read through them:

```shell
yarn
yarn hardhat test
```

This will automatically compile the contracts in the /contracts folder, and run the test coverage found in /test
