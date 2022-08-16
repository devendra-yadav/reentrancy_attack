//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Bank {

    mapping(address=>uint256) balances;


    function deposit() external payable{
        balances[msg.sender] += msg.value;
    }

    function withdraw() external{
        payable(msg.sender).transfer(balances[msg.sender]);
        balances[msg.sender]=0;
    }
}