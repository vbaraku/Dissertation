pragma solidity 0.8.12;

contract Purchase {
    address payable public beneficiary;
    uint256 public requestedAmount;
    string[] public ipfsCIDs;
    string[] public interestedBuyers;
    bytes32[] public hashedSamples;
    bytes32 public randomHashPicked;
    bytes public unHashedSample;
    bytes[] public unHashedKeys;
    address payable public buyerDeposit;
    uint public depositTime;
    bool public isFinished;

    constructor(uint256 wantedAmount, address payable creator, string[] memory cids) {
        beneficiary = creator;
        requestedAmount = wantedAmount;
        ipfsCIDs = cids;
        isFinished = false;
    }

    modifier SellerCantBuy() {
        require(
            msg.sender != beneficiary,
            "You are the seller you can't purchase your own product"
        );
        _;
    }

    modifier OnlyOwner(){
        require(
            msg.sender == beneficiary,
            "Only the owner can do this action"
        );
        _;
    }

    function getPrice() public view returns (uint256 price) {
        return requestedAmount;
    }

    function setPrice(uint256 newPrice) public OnlyOwner {
        requestedAmount = newPrice;
    }

    function getOwner() public view returns (address owner) {
        return beneficiary;
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

    function getCIDs() public view returns (string[] memory){
        return ipfsCIDs;
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

    function purchaseProducts() public payable SellerCantBuy{
        require(requestedAmount == msg.value, "invalid amount");
        buyerDeposit = payable(msg.sender);
        depositTime = block.timestamp;
    }

    function returnDeposit() public {
        require(msg.sender == buyerDeposit, "You have nothing deposited");
        require(block.timestamp - depositTime > 86400, "24 hours have not passed yet, please wait");
        buyerDeposit.transfer(address(this).balance);
    }

    function withdraw(bytes[] memory uhashedKeys) public OnlyOwner{
        require(address(this).balance != 0, "there is no deposited money");
        require(uhashedKeys.length == hashedSamples.length);
        for(uint i =0; i < uhashedKeys.length ; i++){
            require(hashedSamples[i] == keccak256(uhashedKeys[i]), "product does not match the originally uploaded one");
        }
        unHashedKeys = uhashedKeys;
        beneficiary.transfer(address(this).balance);
    }

    function getProduct() public returns (bytes[] memory, string[] memory) {
        require(msg.sender == buyerDeposit, "You can not collect this product");
        isFinished = true;
        return (unHashedKeys, ipfsCIDs);
    }
}
