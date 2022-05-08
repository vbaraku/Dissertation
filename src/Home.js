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
import ViewDetails from "./components/ViewDetails";
import Grid from "@mui/material/Grid";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
function Home() {
  const [contracts, setContracts] = useState([]);
  const [contractsData, setContractsData] = useState([]);
  const [priceToChange, setPriceToChange] = useState();

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }
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
            let title1 = await e.getTitle();
            let price1 = ethers.utils.formatEther(await e.getPrice());
            let owner1 = await e.getOwner();
            let cids1 = await e.getCIDs();
            let interestedBuyers1 = await e.getInterestedBuyers();
            let address1 = e.address;
            let data = {
              title: title1,
              price: price1,
              owner: owner1,
              cids: cids1,
              address: address1,
              interestedBuyers: interestedBuyers1,
            };
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

  useEffect(() => {
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

  async function requestSample(address) {
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const ethAddress = await signer.getAddress();
    const hash = await ethers.utils.keccak256(ethAddress);
    const sig = await signer.signMessage(ethers.utils.arrayify(hash));
    const pk = ethers.utils.recoverPublicKey(
      ethers.utils.arrayify(
        ethers.utils.hashMessage(ethers.utils.arrayify(hash))
      ),
      sig
    );
    const contract = new ethers.Contract(address, Purchase.abi, signer);
    try {
      const transaction = await contract.requestSample(pk);
      await transaction.wait();
      // const transaction2 = await contract.getInterestedBuyers();
      // console.log(transaction2)
    } catch (error) {
      alert("Something went wrong");
      console.log(error);
    }
    console.log(pk);
  }
  console.log(contractsData);

  if (false) {
    return "Loading";
  } else {
    return (
      <div className="App">
        <div className="App-header">
          <Grid spacing={2} style={{ height: "100vh", display: "flex" }}>
            <Grid item xs={2}>
              <Card
                sx={{ height: "100%", backgroundColor: "#37367b", width: 200 }}
              >
                <Link to="/">
                  <Button variant="contained" color="primary">
                    Home
                  </Button>
                </Link>
                <Link to="/tools">
                  <Button variant="contained" color="primary">
                    Encryption Tools
                  </Button>
                </Link>
              </Card>
            </Grid>
            <Grid item xs={10}>
              {contractsData.map((el) => (
                <Card sx={{ minWidth: 275, maxWidth: 350, margin: 2 }}>
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14 }}
                      color="text.secondary"
                      gutterBottom
                    >
                      Owner: {el.owner}
                    </Typography>
                    <Typography variant="h5" component="div">
                      Title:
                    </Typography>
                    <Typography
                      noWrap={true}
                      sx={{ mb: 1.5 }}
                      color="text.secondary"
                    >
                      {el.title}
                    </Typography>
                    <Typography variant="body2">
                      The price of this product is:
                      <br />
                      {el.price} eth
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {/* <Button
                        size="small"
                        onClick={(e) => setPriceOnContract(el.address)}
                      >
                        Change price
                      </Button> */}
                    {/* <input
                        size="4"
                        onChange={(e) => setPriceToChange(e.target.value)}
                        placeholder="set price"
                      ></input> */}
                    {/* <Button
                        variant="contained"
                        position=""
                        color="success"
                        onClick={(e) => requestSample(el.address)}
                      >
                        Request Sample
                      </Button> */}
                    {/* <Button
                        variant="contained"
                        position=""
                        color="success"
                        onClick={(e) => purchaseProduct(el.address, el.price)}
                      >
                        Buy
                      </Button> */}
                    <ViewDetails
                      title={el.title}
                      address={el.address}
                      cids={el.cids}
                      owner={el.owner}
                      price={el.price}
                      interestedBuyers={el.interestedBuyers}
                      func={fetchData}
                    ></ViewDetails>
                  </CardActions>
                </Card>
              ))}
              <AddProduct func={fetchData}></AddProduct>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}
export default Home;
