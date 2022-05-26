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


  if (false) {
    return "Loading";
  } else {
    return (
      <div className="App">
        <div className="App-header">
          <Grid spacing={2} style={{ height: "100vh", display: "flex" }}>
            <Grid item xs={2}>
              <Card
                sx={{ height: "100%", backgroundColor: "#454a75", width: 200 }}
              >
                <Link to="/">
                  <Button variant="contained" sx={{backgroundColor : "#b8fbf6", color: "black", width: "200px"}}>
                    Home
                  </Button>
                </Link>
                <Link to="/tools">
                  <Button variant="contained" sx={{backgroundColor : "#b8fbf6", color: "black", width: "200px"}}>
                    Encryption Tools
                  </Button>
                </Link>
                <AddProduct func={fetchData}></AddProduct>

              </Card>
            </Grid>
            <Grid item xs={10} sx={{display: "flex", flexWrap: "wrap", height: 250}}>
              {contractsData.map((el) => (
                <Card sx={{ minWidth: 275, maxWidth: 350, margin: 2}}>
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14 }}
                      color="text.secondary"
                      gutterBottom
                      noWrap={true}
                    >
                      Owner: <br></br> {el.owner}
                    </Typography>
                    <Typography
                      noWrap={true}
                      color="text.secondary"
                    >
                     Title:
                    </Typography>
                    <Typography variant="h5" component="div" sx={{mb: 1}}>
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
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}
export default Home;
