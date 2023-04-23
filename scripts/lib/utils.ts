import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signature, TypedDataField } from "ethers"
import { ethers } from "hardhat"

type DomainType = {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}

export const getERC712Domain = async (name: string, chainId: number, tokenAddress: string): Promise<DomainType> => {
    const domain = {
        name: name,
        version: "1",
        chainId: chainId,
        verifyingContract: tokenAddress
    };
    return domain
}

const splitSig = async (signature: any) => {
    try {
        const splitsig = ethers.utils.splitSignature(signature)
        return splitsig
    } catch (err) {
        console.log("SPLIT SIG ERROR")
        console.log(err)
        return
    }
}

export const signTypedData = async (_signer: SignerWithAddress, _domain: any, _types: Record<string, TypedDataField[]>, _values: object) => {
    try {
        const signature = await _signer._signTypedData(_domain, _types, _values)
        return splitSig(signature)

    } catch (err) {
        console.log(err)
        console.log("Signing Error")
        return ""
    }
}

export const verifyTypedData = async (_signer: SignerWithAddress, _domain: any, _types: Record<string, TypedDataField[]>, _values: object, _signature: any) => {
    try {
        const signature = await ethers.utils.verifyTypedData(_domain, _types, _values, _signature)
        return signature
    } catch (err) {
        console.log(err)
        console.log("verifying Error")
        return ""
    }
}