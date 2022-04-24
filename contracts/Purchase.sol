pragma solidity 0.8.12;

contract Purchase {
    address payable public beneficiary;
    uint256 public requestedAmount;
    string[] public ipfsCIDs;
    string[] public interestedBuyers;
    bytes32[] public hashedSamples;
    bytes32 public randomHashPicked;
    bytes public unHashedSample;

    constructor(uint256 wantedAmount, address payable creator, string[] memory cids) {
        beneficiary = creator;
        requestedAmount = wantedAmount;
        ipfsCIDs = cids;
    }

    modifier SellerCantBuy() {
        require(
            msg.sender != beneficiary,
            "You are the seller you can't purchase your own product"
        );
        _;
    }

    modifier OnlyOwnerCanSetPrice(){
        require(
            msg.sender == beneficiary,
            "Only the owner can change the price"
        );
        _;
    }

    function getPrice() public view returns (uint256 price) {
        return requestedAmount;
    }

    function setPrice(uint256 newPrice) public OnlyOwnerCanSetPrice {
        requestedAmount = newPrice;
    }

    function getOwner() public view returns (address owner) {
        return beneficiary;
    }

    function getCIDs() public view returns (string[] memory) {
        return ipfsCIDs;
    }

    function buy() public payable SellerCantBuy {
        require(requestedAmount == msg.value, "invalid amount");
        beneficiary.transfer(msg.value);
    }

    function requestSample(string memory pkOfBuyer) public{
        interestedBuyers.push(pkOfBuyer);
    }

    function getInterestedBuyers() public view returns (string[] memory) {
        return interestedBuyers;
    }

    function pickHashedSample(bytes32[] memory hashedKeys) public {
        hashedSamples = hashedKeys;
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % hashedKeys.length;
        randomHashPicked = hashedKeys[randomIndex];
    }

    function returnRandomHashPicked() public view returns (bytes32 randHash){
        return randomHashPicked;
    }

    function putUnhashedSample(bytes memory unHashedS) public {
        bytes32 hashingToCompare = keccak256(unHashedS);
        require(hashingToCompare == randomHashPicked, "hashes do not match");
        unHashedSample = unHashedS;
    }

    function returnUnHashedSample() public view returns (bytes memory unHashed){
        return unHashedSample;
    }
}
