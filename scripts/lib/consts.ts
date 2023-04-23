
//type data for hashing and signing ERC20Permit
export const PermitTypes = {
    Permit: [{
        name: "owner",
        type: "address"
    },
    {
        name: "spender",
        type: "address"
    },
    {
        name: "value",
        type: "uint256"
    },
    {
        name: "nonce",
        type: "uint256"
    },
    {
        name: "deadline",
        type: "uint256"
    },
    ],
};