import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseUnits } from "ethers/lib/utils";
import { Signature } from "ethers";
import { getERC712Domain, signTypedData, verifyTypedData } from "../scripts/lib/utils";
import { PermitTypes } from "../scripts/lib/consts";

const MONTH = Math.floor(((Date.now()) / 1000) + (60 * 60 * 24 * 30))

describe("ERC20 Permit", () => {
    async function deploy() {
        const [tokenOwner, tokenReceiver, paymaster] = await ethers.getSigners()
        const deadline = MONTH

        let chainID = (await paymaster.provider?.getNetwork())?.chainId || 31337
        const MockPermitTokenFactory = await ethers.getContractFactory("MockPermitToken", paymaster)
        const MockPermitToken = await MockPermitTokenFactory.deploy()
        await MockPermitToken.deployed()
        const mint = async (_address: string) => {
            try {
                const _mint = await MockPermitToken.safeMint(
                    _address,
                    parseUnits("42", (await MockPermitToken.decimals()))
                )
                await _mint.wait()
                return
            } catch (err) {
                console.log("mint error")
                console.log(err)
                return
            }
        }

        await mint(tokenOwner.address)
        const domain = await getERC712Domain("PermitToken", chainID, MockPermitToken.address)

        return { MockPermitToken, tokenOwner, tokenReceiver, paymaster, chainID, deadline, domain }
    }
    describe("Deployment", async function () {
        it("Owner should become paymaster upon deployment", async function () {
            const context = await loadFixture(deploy)
            expect(await context.MockPermitToken.OWNER()).to.equal(context.paymaster.address)
        })
        it("TokenOwner should receive their initial 42 tokens", async function () {
            const context = await loadFixture(deploy)
            const balance = await context.MockPermitToken.balanceOf(context.tokenOwner.address)
            expect(balance).to.equal(parseUnits("42", (await context.MockPermitToken.decimals())))
        })
        it("TokenReceiver should have no tokens upon deployment", async function () {
            const context = await loadFixture(deploy)
            expect(await context.MockPermitToken.balanceOf(context.tokenReceiver.address)).to.equal(parseUnits("0", (await context.MockPermitToken.decimals())))
        })
    })
    describe("Permitting", async function () {

        it("Signature of typedata should be verifiable by the owner of the signature", async function () {
            const context = await loadFixture(deploy)

            const permitPayload = {
                owner: context.tokenOwner.address,
                spender: context.tokenReceiver.address,
                value: ethers.utils.parseUnits("42", 18),
                nonce: (await context.MockPermitToken.nonces(context.tokenOwner.address)),
                deadline: context.deadline
            }

            const signature = await signTypedData(
                context.tokenOwner,
                await getERC712Domain("Permit Token", context.chainID, context.MockPermitToken.address),
                PermitTypes,
                permitPayload
            )
            //get signature
            const recoveredAddress = await verifyTypedData(
                context.tokenOwner,
                await getERC712Domain("Permit Token", context.chainID, context.MockPermitToken.address),
                PermitTypes,
                permitPayload,
                signature
            )
            //verifySignature
            expect(recoveredAddress).to.equal(context.tokenOwner.address)
        })
        it("Token Owner Should Be Able to Permit their own Signature", async function () {
            const context = await loadFixture(deploy)
            const permitPayload = {
                owner: context.tokenOwner.address,
                spender: context.tokenReceiver.address,
                value: ethers.utils.parseUnits("42", 18),
                nonce: (await context.MockPermitToken.nonces(context.tokenOwner.address)),
                deadline: context.deadline
            }
            const signature = await signTypedData(
                context.tokenOwner,
                context.domain,
                PermitTypes,
                permitPayload
            ) as Signature
            expect(await context.MockPermitToken.connect(context.tokenOwner).permit(context.tokenOwner.address, context.tokenReceiver.address, ethers.utils.parseUnits("42", 18), context.deadline, signature?.v, signature?.r, signature?.s)).to.not.be.reverted
        })
        it("Paymaster should be able to Permit TokenOwner's signature if Paymaster possesses signature", async function () {
            const context = await loadFixture(deploy)
            const permitPayload = {
                owner: context.tokenOwner.address,
                spender: context.tokenReceiver.address,
                value: ethers.utils.parseUnits("42", 18),
                nonce: (await context.MockPermitToken.nonces(context.tokenOwner.address)),
                deadline: context.deadline
            }
            const signature = await signTypedData(
                context.tokenOwner,
                context.domain,
                PermitTypes,
                permitPayload
            ) as Signature

            expect(await context.MockPermitToken.permit(context.tokenOwner.address, context.tokenReceiver.address, ethers.utils.parseUnits("42", 18), context.deadline, signature?.v, signature?.r, signature?.s)).to.not.be.reverted
        })
        it("Paymaster should be able to Permit TokenOwner's signature and Transfer Tokens to TokenReceiver", async function () {
            const context = await loadFixture(deploy)
            const permitPayload = {
                owner: context.tokenOwner.address,
                spender: context.tokenReceiver.address,
                value: ethers.utils.parseUnits("42", 18),
                nonce: (await context.MockPermitToken.nonces(context.tokenOwner.address)),
                deadline: context.deadline
            }
            const signature = await signTypedData(
                context.tokenOwner,
                context.domain,
                PermitTypes,
                permitPayload
            ) as Signature
            const permittx = await context.MockPermitToken.permit(context.tokenOwner.address, context.tokenReceiver.address, ethers.utils.parseUnits("42", 18), context.deadline, signature?.v, signature?.r, signature?.s)
            await permittx.wait()

            const sendTx = await context.MockPermitToken.connect(context.paymaster).transfer(context.tokenReceiver.address, permitPayload.value)
            await sendTx.wait()
            expect(await context.MockPermitToken.balanceOf(context.tokenReceiver.address)).to.equal(permitPayload.value)
        })
    })

})