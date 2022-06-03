import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Purchase from "./artifacts/contracts/Purchase.sol/Purchase.json";
import ContractFactory from "./artifacts/contracts/ContractFactory.sol/ContractFactory.json";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
function History() {
  const [contracts, setContracts] = useState([]);
  const [contractsData, setContractsData] = useState([]);

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
              if (el.isFinished) {
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
                background: "linear-gradient(to bottom, #118ab2, #118ab2);",
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
            </Card>
          </Grid>
          <Grid item xs={10} sx={{marginLeft: "auto", marginRight: "auto"}}>
            <div style={{ padding: 15 }}>
              <TableContainer component={Paper}>
                <Table
                  sx={{ minWidth: 1050, marginLeft: "auto" }}
                  size="small"
                  aria-label="simple table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Contract Title</TableCell>
                      <TableCell align="left">Seller</TableCell>
                      <TableCell align="left">Buyer</TableCell>
                      <TableCell align="left">Purchase price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contractsData.map((row) => (
                      <TableRow
                        key={row.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.title}
                        </TableCell>
                        <TableCell align="left">{row.owner}</TableCell>
                        <TableCell align="left">{row.buyer}</TableCell>
                        <TableCell align="left">{row.price} ETH</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
export default History;
