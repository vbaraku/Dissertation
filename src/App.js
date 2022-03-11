import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Purchase from "./artifacts/contracts/Purchase.sol/Purchase.json";
import { formatEther } from "ethers/lib/utils";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const purchaseAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
function App() {
  const [price, setPrice] = useState();
  const [priceToChange, setPriceToChange] = useState();
  const [owner, setOwner] = useState();

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  useEffect(() => {
    const fetchData = async function fetchContractDetails() {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          purchaseAddress,
          Purchase.abi,
          provider
        );
        try {
          const data = await ethers.utils.formatEther(
            await contract.getPrice()
          );
          setPrice(data);
          const owner = await contract.getOwner();
          setOwner(owner);
          console.log("price ", data);
          console.log("owner ", owner);
        } catch (err) {
          console.log("error ", err);
        }
      }
    };
    fetchData();
  }, []);

  async function setPriceOnContract() {
    if (!price) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        purchaseAddress,
        Purchase.abi,
        signer
      );
      try {
        const transaction = await contract.setPrice(
          ethers.utils.parseEther(priceToChange)
        );
        await transaction.wait();
        setPrice(priceToChange);
      } catch (error) {
        alert("Only the owner can change the price");
        console.log(error);
      }
    }
  }

  async function purchaseProduct() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        purchaseAddress,
        Purchase.abi,
        signer
      );
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

  if (price != null) {
    return (
      <div className="App">
        <header className="App-header">
          <Card sx={{ minWidth: 275, maxWidth: 280 }}>
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
              <Typography noWrap={true} sx={{ mb: 1.5 }} color="text.secondary">
                {owner}
              </Typography>
              <Typography variant="body2">
                The price of this contract is:
                <br />
                {price} eth
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={setPriceOnContract}>
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
                onClick={purchaseProduct}
              >
                Buy
              </Button>
            </CardActions>
          </Card>
        </header>
      </div>
    );
  } else {
    return "LOADING";
  }
}

export default App;
