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
  const [keysHashed, setKeysHashed] = React.useState({
    files: [],
  });
  const [keysFinal, setKeysFinal] = React.useState({
    files: [],
  });
  const retrieveKeys1 = (e) => {
    console.log(e.target.files);
    setKeysHashed({ files: [...keysHashed.files, ...e.target.files] });
  };
  const retrieveKeys3 = (e) => {
    console.log(e.target.files);
    setKeysFinal({ files: [...keysFinal.files, ...e.target.files] });
  };
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(props.address, Purchase.abi, signer);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function requestSample() {
    const ethAddress = await signer.getAddress();
    const hash = ethers.utils.keccak256(ethAddress);
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
    let longString = await keysHashed.files[0].text();
    console.log(longString);
    let arrayString = longString.split(",");
    try {
      const transaction = await contract.pickHashedSample(arrayString);
      await transaction.wait();
      const transaction2 = await contract.returnRandomHashPicked();
      alert(
        "The random hash that was picked and needs to be provided unhashed is hash with index " +
          transaction2[1] +
          " . " +
          transaction2[0]
      );
    } catch (error) {
      alert("Only the owner can provide keys");
      console.log(error);
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
        alert("The unhashed key was delivered");
      } catch (error) {
        alert("Only the owner can provide keys");
        console.log(error);
      }
    }
  }

  async function viewSampleKey() {
    try {
      const transaction = await contract.returnUnHashedSample();
      console.log(transaction);
      alert(
        "The unhashed key will be downloaded. The CID to the sample file is: " +
          props.cids[transaction[1]]
      );
      var element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(transaction[0])
      );
      element.setAttribute("download", "KeySample");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
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
      alert("Owner cannot buy");
      console.log(error);
    }
  }

  async function withdrawFunds() {
    try {
      let longString = await keysFinal.files[0].text();
      let productKeys = longString.split(",");
      const transaction = await contract.withdraw(productKeys);
    } catch (error) {
      alert("Keys do not match the originally uploaded ones");
      console.log(error);
    }
  }

  async function cancelPurchase() {
    try {
      const transaction = await contract.returnDeposit();
    } catch (error) {
      alert("24h have not passed yet");
      console.log(error);
    }
  }

  async function getKeys() {
    try {
      const transaction = await contract.getProduct();
      const finish = await contract.finish();
      alert("Keys will be downloaded. Cids of the files are: " + props.cids);
      var element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(transaction)
      );
      element.setAttribute("download", "SetOfKeys");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      window.location.reload();
      
    } catch (error) {
      alert("Only the buyer can get the keys");
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
          <Input
            id="hashedKeys"
            type="file"
            multiple
            name="data"
            onChange={retrieveKeys1}
          ></Input>
          <br></br>
          <Button
            sx={{ margin: "5px" }}
            variant="outlined"
            onClick={provideUnHashedKeys}
          >
            Provide non-hashed key
          </Button>

          <Input id="unHashedKeys"></Input>
          <br></br>
          <Button
            sx={{ margin: "5px" }}
            variant="outlined"
            onClick={viewSampleKey}
          >
            View sample key
          </Button>
          <br></br>
          <Button
            sx={{ margin: "5px" }}
            variant="contained"
            color="success"
            onClick={purchaseRequest}
          >
            Purchase request
          </Button>
          <Button
            sx={{ margin: "5px" }}
            variant="contained"
            color="error"
            onClick={cancelPurchase}
          >
            Cancel purchase
          </Button>
          <br></br>
          <Button
            sx={{ margin: "5px" }}
            variant="contained"
            color="success"
            onClick={withdrawFunds}
          >
            Withdraw funds
          </Button>
          <Input
            type="file"
            multiple
            name="data"
            onChange={retrieveKeys3}
            id="withdraw"
          ></Input>
          <br></br>
          <Button
            sx={{ margin: "5px" }}
            variant="contained"
            color="success"
            onClick={getKeys}
          >
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
