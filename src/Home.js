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
            let data = {
              title: await e.getTitle(),
              price: ethers.utils.formatEther(await e.getPrice()),
              owner: await e.getOwner(),
              cids: await e.getCIDs(),
              address: e.address,
              interestedBuyers: await e.getInterestedBuyers(),
              isFinished: await e.getFinish(),
              buyer: await e.getBuyerAddress(),
            };
            console.log(data);
            return data;
          });

          Promise.all(promises).then((results) => {
            let notFinished = results.filter((el) => {
              if (!el.isFinished) {
                return el;
              }
            });

            setContractsData(notFinished);
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

  return (
    <div className="App">
      <div className="App-header">
        <Grid spacing={2} style={{ height: "100vh", display: "flex" }}>
          <Grid item xs={2}>
            <Card
              sx={{
                height: "100%",
                background: "linear-gradient(to bottom, #454a75, #4E5383);",
                padding: 2,
              }}
              elevation={3}
            >
              <Grid direction="column" container gap={1}>
                <Grid item>
                  <Link to="/">
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "white",
                        color: "black",
                        width: "200px",
                      }}
                    >
                      Home
                    </Button>
                  </Link>
                </Grid>
                <Grid item>
                  <Link to="/tools">
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "white",
                        color: "black",
                        width: "200px",
                      }}
                    >
                      Encryption Tools
                    </Button>
                  </Link>
                </Grid>
                <Grid item>
                  <Link to="/history">
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "white",
                        color: "black",
                        width: "200px",
                      }}
                    >
                      History
                    </Button>
                  </Link>
                </Grid>
              </Grid>
              <AddProduct func={fetchData}></AddProduct>
            </Card>
          </Grid>
          <Grid
            item
            xs={10}
            sx={{ display: "flex", flexWrap: "wrap", height: 250 }}
          >
            {contractsData.map((el) => (
              <Card sx={{ minWidth: 275, maxWidth: 350, margin: 2 }}>
                <CardContent>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                    noWrap={true}
                  >
                    Owner: <br></br> {el.owner}
                  </Typography>
                  <Typography noWrap={true} color="text.secondary">
                    Title:
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                    {el.title}
                  </Typography>

                  <Typography variant="body2">
                    The price of this product is:
                    <br />
                    {el.price} eth
                  </Typography>
                </CardContent>
                <CardActions>
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
export default Home;
