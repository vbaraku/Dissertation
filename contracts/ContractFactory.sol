pragma solidity 0.8.12;

import "./Purchase.sol";

contract ContractFactory {
    Purchase[] private _purchases;

    event contractCreated(address contractAddress, uint wantedAmount, address owner);

    function createPurchase(uint256 wantedAmount) public {
        Purchase purchase = new Purchase(wantedAmount, payable(msg.sender));
        _purchases.push(purchase);
        emit contractCreated(address(purchase), wantedAmount, msg.sender);
    }

    function getContracts() public view returns( Purchase[] memory){
        return _purchases;
    }
}
