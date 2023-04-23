// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockPermitToken is ERC20, ERC20Permit {
    uint256 MAX_SUPPLY = 100_000_000 * 10 ** 18;
    address public immutable OWNER;

    constructor() ERC20("PermitToken", "PRMT") ERC20Permit("PermitToken") {
        _mint(msg.sender, 100 * 10 ** 18);
        OWNER = msg.sender;
    }

    // function safeMint() public

    function safeMint(address to, uint amount) external {
        require(msg.sender == OWNER, "Only Owner Can Mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max Supply Reached");
        _mint(to, amount);
    }
}
