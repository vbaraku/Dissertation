import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Purchase from "./artifacts/contracts/Purchase.sol/Purchase.json";
import ContractFactory from "./artifacts/contracts/ContractFactory.sol/ContractFactory.json";
import { formatEther } from "ethers/lib/utils";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddProduct from "./components/AddProduct";

const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
function App() {
  const [contracts, setContracts] = useState([]);
  const [contractsData, setContractsData] = useState([]);
  const [priceToChange, setPriceToChange] = useState();

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  useEffect(() => {
    const fetchData = async function fetchContractDetails() {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const factory = new ethers.Contract(
          factoryAddress,
          ContractFactory.abi,
          provider
        );
        try {
          const data = await factory.getContracts();
          console.log(data);
          if (data != null) {
            let tempArray = [];
            data.forEach((e) => {
              const purchase = new ethers.Contract(e, Purchase.abi, provider);
              tempArray.push(purchase);
            });
            setContracts(tempArray);
            const promises = tempArray.map(async (e) => {
              let price1 = ethers.utils.formatEther(await e.getPrice());
              let owner1 = await e.getOwner();
              let address1 = e.address;
              let data = { price: price1, owner: owner1, address: address1 };
              console.log(data);
              return data;
            });

            Promise.all(promises).then((results) => {
              console.log(results);
              setContractsData(results);
            });
          }
        } catch (err) {
          console.log("error ", err);
        }
      }
    };
    fetchData();
  }, []);

  async function setPriceOnContract(address) {
    if (!contracts) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, Purchase.abi, signer);
      try {
        const transaction = await contract.setPrice(
          ethers.utils.parseEther(priceToChange)
        );
        await transaction.wait();
      } catch (error) {
        alert("Only the owner can change the price");
        console.log(error);
      }
    }
    window.location.reload(); // NEEDS TO BE CHANGED LATER TO UPDATE WITHOUT RELOADING
  }

  async function purchaseProduct(address, price) {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, Purchase.abi, signer);
      try {
        const transaction = await contract.buy({
          value: ethers.utils.parseEther(price),
        });
        await transaction.wait();
      } catch (error) {
        alert("You are the owner you cannot buy your product");
        console.log(error);
      }
    }
  }

  if (!contractsData.length) {
    return "Loading";
  } else {
    return (
      <div className="App">
        <header className="App-header">
          <div>
            {contractsData.map((el) => (
              <Card sx={{ minWidth: 275, maxWidth: 280, margin: 2 }}>
                <CardContent>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                  >
                    This is a smart contract
                  </Typography>
                  <Typography variant="h5" component="div">
                    Owner:
                  </Typography>
                  <Typography
                    noWrap={true}
                    sx={{ mb: 1.5 }}
                    color="text.secondary"
                  >
                    {el.owner}
                  </Typography>
                  <Typography variant="body2">
                    The price of this contract is:
                    <br />
                    {el.price} eth
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={(e) => setPriceOnContract(el.address)}
                  >
                    Change price
                  </Button>
                  <input
                    size="4"
                    onChange={(e) => setPriceToChange(e.target.value)}
                    placeholder="set price"
                  ></input>
                  <Button
                    variant="contained"
                    position=""
                    color="success"
                    onClick={(e) => purchaseProduct(el.address, el.price)}
                  >
                    Buy
                  </Button>
                </CardActions>
              </Card>
            ))}
          </div>
          <AddProduct></AddProduct>
        </header>
      </div>
    );
  }
}
export default App;
