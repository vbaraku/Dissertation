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
    if (document.getElementById("hashedKeys").value == "") {
      alert("Hashed keys field cannot be empty");
    } else {
      let longString = document.getElementById("hashedKeys").value;
      let arrayString = longString.split(",").map((el) => "0x" + el);
      try {
        const transaction = await contract.pickHashedSample(arrayString);
        await transaction.wait();
        const transaction2 = await contract.returnRandomHashPicked();
        alert(
          "The random hash that was picked and needs to be provided unhashed is hash nr " +
            transaction2[1] + ". " + transaction2[0]
        );
      } catch (error) {
        alert("Something went wrong");
        console.log(error);
      }
    }
  }

  async function provideUnHashedKeys() {
    if (document.getElementById("unHashedKeys").value == "") {
      alert("Un-Hashed keys field cannot be empty");
    } else {
      let unHashedKey = document.getElementById("unHashedKeys").value;

      try {
        const transaction = await contract.putUnhashedSample(unHashedKey);
        await transaction.wait();
        alert(
          "The unhashed key was delivered"
        );
      } catch (error) {
        alert("Something went wrong");
        console.log(error);
      }
    }
  }

  async function viewSampleKey() {
      try {
        const transaction = await contract.returnUnHashedSample();
        console.log(transaction);
        alert(
          "The unhashed key is: " + transaction[0] + " with CID: " + props.cids[transaction[1]]
        );
      } catch (error) {
        alert("Something went wrong");
        console.log(error);
      }
    }
  
    async function purchaseRequest() {
      try {
        const transaction = await contract.purchaseProducts({
          value: ethers.utils.parseEther(props.price),
        });
        alert(
          "The ether has been deposited. Owner has 24h to provide the rest of the keys." 
        );
      } catch (error) {
        alert("Something went wrong");
        console.log(error);
      }
    }

    async function withdrawFunds() {
      try {
        let productKeys = document.getElementById("withdraw").value.split(",");
        const transaction = await contract.withdraw(productKeys);
        
      } catch (error) {
        alert("Something went wrong");
        console.log(error);
      }
    }

    async function cancelPurchase(){
      try {
        const transaction = await contract.returnDeposit();
        
      } catch (error) {
        alert("Something went wrong");
        console.log(error);
      }
    }

    async function getKeys(){
      try {
        const transaction = await contract.getProduct();
        console.log(transaction.value)
        alert("Keys are: " + transaction.value + ". Cids are: " )
        
      } catch (error) {
        alert("Something went wrong");
        console.log(error);
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
          <DialogContentText>Title: {props.title}</DialogContentText>
          <DialogContentText>Owner: {props.owner}</DialogContentText>
          <DialogContentText>Price: {props.price} Eth</DialogContentText>
          <DialogContentText>
            Interested Buyer: {props.interestedBuyers}
          </DialogContentText>
          <Button
            sx={{ margin: "5px" }}
            variant="outlined"
            onClick={requestSample}
          >
            Request Sample
          </Button>
          <br></br>
          <Button
            sx={{ margin: "5px" }}
            variant="outlined"
            onClick={provideHashedKeys}
          >
            Provide hashed keys
          </Button>
          <Input id="hashedKeys"></Input>
          <br></br>
          <Button sx={{ margin: "5px" }} variant="outlined" onClick={provideUnHashedKeys}>
            Provide non-hashed key
          </Button>
          <Input id="unHashedKeys"></Input>
          <br></br>
          <Button sx={{ margin: "5px" }} variant="outlined" onClick={viewSampleKey}>
            View sample key
          </Button>
          <br></br>
          <Button sx={{ margin: "5px" }} variant="contained" color="success" onClick={purchaseRequest}>
            Purchase request
          </Button>
          <Button sx={{ margin: "5px" }} variant="contained" color="error" onClick={cancelPurchase}>
            Cancel purchase
          </Button>
          <br></br>
          <Button sx={{ margin: "5px" }} variant="contained" color="success" onClick={withdrawFunds}>
            Withdraw funds
          </Button>
          <Input id="withdraw"></Input>
          <br></br>
          <Button sx={{ margin: "5px" }} variant="contained" color="success" onClick={getKeys}>
            Get product keys
          </Button>
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
