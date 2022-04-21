import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import ContractFactory from "../artifacts/contracts/ContractFactory.sol/ContractFactory.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import * as IPFS from "ipfs-core";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddProduct() {
  const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [open, setOpen] = React.useState(false);

  const [priceOfNew, setPriceOfNew] = React.useState();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  const [images, setImages] = React.useState({
    files: [],
  });

  const [ipfsCIDs, setIpfsCIDs] = React.useState([]);
  const [disabledButton, setDisabledButton] = React.useState(true);

  const retrieveFile = (e) => {
    console.log("retrieve file called");
    console.log(e.target.files);
    setImages({ files: [...images.files, ...e.target.files] });
  };

  const handleSubmit2 = (e) => {
    e.preventDefault();
    console.log(images);
    let tempArray = [];
    IPFS.create().then((ipfs) => {
      images.files.forEach((e) => {
        console.log(e);
        ipfs.add(e).then(({ cid }) => {
          tempArray.push(cid.toString());
          setDisabledButton(false);
          console.log(cid.toString());
        });
      });
      setIpfsCIDs(tempArray);
    });
  };

  console.log(ipfsCIDs);

  const handleSubmit = async () => {
    if (!priceOfNew) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        factoryAddress,
        ContractFactory.abi,
        signer
      );
      try {
        const transaction = await contract.createPurchase(
          ethers.utils.parseEther(priceOfNew),
          ipfsCIDs
        );
        await transaction.wait();
      } catch (error) {
        alert("There was an error");
        console.log(error);
      }
    }
    setOpen(false);
    window.location.reload(); // NEEDS TO BE CHANGED LATER TO UPDATE WITHOUT RELOADING
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        New product
      </Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Add new product"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Please provide the wanted amount in Ether:
            <FormControl sx={{ m: 1, width: "18ch" }} variant="outlined">
              <OutlinedInput
                required
                style={{ height: "1cm" }}
                id="outlined-adornment-amount"
                onChange={(e) => setPriceOfNew(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">ETH</InputAdornment>
                }
                inputProps={{
                  "aria-label": "price",
                }}
              />
            </FormControl>
          </DialogContentText>
          <DialogContentText>
            Please upload your data:
            <form className="form" onSubmit={handleSubmit2}>
              <input type="file" multiple name="data" onChange={retrieveFile} />
              <button type="submit" className="btn">
                Upload file
              </button>
            </form>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={disabledButton}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
