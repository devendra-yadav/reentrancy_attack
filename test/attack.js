
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {ethers} = require("hardhat");
const {expect} = require("chai");

const tokens = (n)=> {
    return ethers.utils.parseEther(n);
}

describe("Attack", ()=>{

    async function contractDeployment(){
        const [deployer, user] = await ethers.getSigners();

        const Bank = await ethers.getContractFactory("Bank");
        const bank =await Bank.deploy();
        await bank.deployed();

        let transaction = await bank.connect(user).deposit({value: tokens("7000")});
        await transaction.wait();

        const Attacker = await ethers.getContractFactory("Attacker");
        const attacker = await Attacker.deploy(bank.address);
        await attacker.deployed();

        return {bank, attacker, deployer, user}
    }

    describe("Contract Deployment", ()=>{
        it("deployed successfuly", async ()=>{
            const {bank, attacker, deployer, user} = await loadFixture(contractDeployment);
            
            console.log(`Bank contract deployed at ${bank.address}`)
            console.log(`Attacker contract deployed at ${attacker.address}`)
            expect(bank.address).to.be.properAddress;
            expect(attacker.address).to.be.properAddress;
        })
    })

    describe("Deposit Withdraw functionality", ()=>{
        it("deposited successfully", async () => {
            const {bank, deployer, user} = await loadFixture(contractDeployment);
            let contractBalance = await ethers.provider.getBalance(bank.address);
            console.log("Contract Balance Before : ",ethers.utils.formatEther(contractBalance));

            let transaction = await bank.deposit({value: tokens("1000")});
            await transaction.wait();
            
            contractBalance = await ethers.provider.getBalance(bank.address);
            console.log("Contract Balance after : ",ethers.utils.formatEther(contractBalance));

            expect(ethers.utils.formatEther(contractBalance)).to.be.equal("8000.0");
        })

        it("withdraw successfully", async ()=>{
            const {bank, deployer, user} = await loadFixture(contractDeployment);

            let userBalance = await ethers.provider.getBalance(user.address);
            console.log("User Balance before deposti : ",ethers.utils.formatEther(userBalance));

            //let user deposit 500
            let transaction = await bank.connect(user).deposit({value: tokens("500")});
            await transaction.wait();

            userBalance = await ethers.provider.getBalance(user.address);
            console.log("User Balance after deposit : ",ethers.utils.formatEther(userBalance));

            let contractBalance = await ethers.provider.getBalance(bank.address);
            console.log("Contract Balance  : ",ethers.utils.formatEther(contractBalance));

            expect(contractBalance).to.be.eq(tokens("7500"));


            transaction = await bank.connect(user).withdraw();
            await transaction.wait();

            contractBalance = await ethers.provider.getBalance(bank.address);
            console.log("Contract Balance after withdraw : ",ethers.utils.formatEther(contractBalance));

            userBalance = await ethers.provider.getBalance(user.address);
            console.log("User Balance after withdraw : ",ethers.utils.formatEther(userBalance));
            expect(contractBalance).to.be.eq(tokens("0"));
        })

        it("allows attacker to drain all funds", async ()=>{
            const {bank, attacker, deployer, user} = await loadFixture(contractDeployment);
            let bankBalance = ethers.utils.formatEther(await ethers.provider.getBalance(bank.address));
            let atttackerBalance = ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address));
            console.log("BEFORE ------")
            console.log(`Bank balance : ${bankBalance}`)
            console.log(`Attacker balance : ${atttackerBalance}`);

            transaction = await attacker.deposit({value: tokens("100")});
            await transaction.wait();

            transaction = await attacker.attack();
            await transaction.wait();


            bankBalance = ethers.utils.formatEther(await ethers.provider.getBalance(bank.address));
            atttackerBalance = ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address));
            console.log("AFTER ------")
            console.log(`Bank balance : ${bankBalance}`)
            console.log(`Attacker balance : ${atttackerBalance}`);

        })
    })

    

})