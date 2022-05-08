pragma solidity 0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";

contract Purchase {
    string public title;
    address payable public beneficiary;
    uint256 public requestedAmount;
    string[] public ipfsCIDs;
    string[] public interestedBuyers;
    string[] public hashedSamples;
    string public randomHashPicked;
    string public unHashedSample;
    string[] public unHashedKeys;
    address payable public buyerDeposit;
    uint256 public depositTime;
    bool public isFinished;
    uint256 public randomSampleId;

    constructor(
        string memory title1,
        uint256 wantedAmount,
        address payable creator,
        string[] memory cids
    ) {
        title = title1;
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

    modifier OnlyOwner() {
        require(msg.sender == beneficiary, "Only the owner can do this action");
        _;
    }

    function getTitle() public view returns (string memory) {
        return title;
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

    function requestSample(string memory pkOfBuyer) public {
        interestedBuyers.push(pkOfBuyer);
    }

    function getInterestedBuyers() public view returns (string[] memory) {
        return interestedBuyers;
    }

    function getCIDs() public view returns (string[] memory) {
        return ipfsCIDs;
    }

    function pickHashedSample(string[] memory hashedKeys) public {
        hashedSamples = hashedKeys;
        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % hashedKeys.length;
        randomSampleId = randomIndex;
        randomHashPicked = hashedKeys[randomIndex];
    }

    function returnRandomHashPicked()
        public
        view
        returns (string memory randHash, uint256 hashId)
    {
        return (randomHashPicked, randomSampleId);
    }

    function putUnhashedSample(string memory unHashedS) public {
        string memory hashingToCompare = Strings.toHexString(
            uint256(keccak256(abi.encodePacked(unHashedS))),
            32
        );
        require(
            keccak256(abi.encodePacked(hashingToCompare)) ==
                keccak256(abi.encodePacked(randomHashPicked)),
            "hashes do not match"
        );
        unHashedSample = unHashedS;
    }

    function returnUnHashedSample() public view returns (string memory unHashed, uint cidSample){
        return (unHashedSample, randomSampleId);
    }

    function returnSampleid() public view returns(uint256 Id){
        return randomSampleId;
    }

    function purchaseProducts() public payable SellerCantBuy {
        require(requestedAmount == msg.value, "invalid amount");
        buyerDeposit = payable(msg.sender);
        depositTime = block.timestamp;
    }

    function returnDeposit() public {
        require(msg.sender == buyerDeposit, "You have nothing deposited");
        require(
            block.timestamp - depositTime > 86400,
            "24 hours have not passed yet, please wait"
        );
        buyerDeposit.transfer(address(this).balance);
    }

    function withdraw(string[] memory uhashedKeys) public OnlyOwner {
        require(address(this).balance != 0, "there is no deposited money");
        require(uhashedKeys.length == hashedSamples.length);
        for (uint256 i = 0; i < uhashedKeys.length; i++) {
            require(
                keccak256(
                    abi.encodePacked(
                        Strings.toHexString(
                            uint256(
                                keccak256(abi.encodePacked(uhashedKeys[i]))
                            ),
                            32
                        )
                    )
                ) == keccak256(abi.encodePacked(hashedSamples[i])),
                "product does not match the originally uploaded one"
            );
        }
        unHashedKeys = uhashedKeys;
        beneficiary.transfer(address(this).balance);
    }

    function getProduct() public view returns (string[] memory) {
        require(msg.sender == buyerDeposit, "You can not collect this product");
        return unHashedKeys;
    }
    function finish() public {
        require(msg.sender == buyerDeposit, "you cannot call this function");
        isFinished = true;
    }
}
