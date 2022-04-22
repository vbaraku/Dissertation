pragma solidity 0.8.12;

import "./Purchase.sol";

contract ContractFactory {
    Purchase[] private _purchases;

    event contractCreated(
        address contractAddress,
        uint256 wantedAmount,
        address owner,
        string[] ipfsCIDs
    );

    function createPurchase(uint256 wantedAmount, string[] memory ipfsCIDs)
        public
    {
        Purchase purchase = new Purchase(
            wantedAmount,
            payable(msg.sender),
            ipfsCIDs
        );
        _purchases.push(purchase);
        emit contractCreated(
            address(purchase),
            wantedAmount,
            msg.sender,
            ipfsCIDs
        );
    }

    function getContracts() public view returns (Purchase[] memory) {
        return _purchases;
    }
}
