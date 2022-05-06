import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import Input from "@mui/material/Input";
import Purchase from "../artifacts/contracts/Purchase.sol/Purchase.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
export default function ViewDetails(props) {
  const [open, setOpen] = React.useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState("sm");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(props.address, Purchase.abi, signer);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
//   async function requestAccount() {
//     await window.ethereum.request({ method: "eth_requestAccounts" });
//   }

  async function requestSample() {
    const ethAddress = await signer.getAddress();
    const hash = await ethers.utils.keccak256(ethAddress);
    const sig = await signer.signMessage(ethers.utils.arrayify(hash));
    const pk = ethers.utils.recoverPublicKey(
      ethers.utils.arrayify(
        ethers.utils.hashMessage(ethers.utils.arrayify(hash))
      ),
      sig
    );
    try {
      const transaction = await contract.requestSample(pk);
      await transaction.wait();
    } catch (error) {
      alert("Something went wrong");
      console.log(error);
    }
    props.func();
    console.log(pk);
  }

  async function provideHashedKeys() {
      if(document.getElementById("hashedKeys").value == ""){
          alert("Hashed keys field cannot be empty")
      }
      else{
        let longString = document.getElementById("hashedKeys").value;
        let arrayString = longString.split(",");
        let inBytes = [];
        arrayString.forEach(element => {
            inBytes.push(ethers.utils.formatBytes32String(element))
        });
        console.log(inBytes);
      }
  }
  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        View Details
      </Button>
      <Dialog
        fullWidth={"100"}
        maxWidth={"100"}
        fullHeight={"100"}
        maxHeight={"100"}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Contract Information</DialogTitle>
        <DialogContent>
          <DialogContentText>Title: XX</DialogContentText>
          <DialogContentText>Owner: {props.owner}</DialogContentText>
          <DialogContentText>Price: {props.price} Eth</DialogContentText>
          <DialogContentText>
            Interested Buyer: {props.interestedBuyers}
          </DialogContentText>
          <Button sx={{ margin: "5px" }} variant="outlined" onClick={requestSample}>
            Request Sample
          </Button>
          <br></br>
          <Button sx={{ margin: "5px" }} variant="outlined" onClick={provideHashedKeys}>
            Provide hashed keys
          </Button>
          <Input id="hashedKeys"></Input>
          <br></br>
          <Button sx={{ margin: "5px" }} variant="outlined">
            Provide non-hashed key
          </Button>
          <Input></Input>
          <br></br>
          <Button sx={{ margin: "5px" }} variant="outlined">
            View sample key
          </Button>
          <br></br>
          <Button sx={{ margin: "5px" }} variant="contained" color="success">
            Purchase request
          </Button>
          <br></br>
          <Button sx={{ margin: "5px" }} variant="contained" color="success">
            Withdraw funds
          </Button>
          <Input></Input>
          <Box
            noValidate
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              m: "auto",
              width: "fit-content",
            }}
          >
            <FormControl sx={{ mt: 2, minWidth: 120 }}></FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
