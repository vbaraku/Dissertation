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
import Input from "@mui/material/Input";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { IconButton } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddProduct(props) {
  const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState("hidden");

  const [priceOfNew, setPriceOfNew] = React.useState();
  const [titleOfNew, setTitleOfNew] = React.useState();

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
    setHidden("visible");

    IPFS.create().then((ipfs) => {
      Promise.all(
        images.files.map(async (file) => {
          const { cid } = await ipfs.add(file);
          return cid.toString();
        })
      ).then((cidHashes) => {
        setDisabledButton(false);
        setIpfsCIDs(cidHashes);
        setHidden("hidden");
      });
    });
    console.log(ipfsCIDs);
  };

  const handleSubmit = async () => {
    if (!priceOfNew) return;
    if (!titleOfNew) return;
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
          titleOfNew,
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
    props.func();
  };

  return (
    <>
      <IconButton
        variant="contained"
        sx={{ position: "absolute", bottom: "20px", right: "20px" }}
        title="New Product"
        onClick={handleClickOpen}
      >
        <AddCircleIcon fontSize="large" />
      </IconButton>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Add new product"}</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-slide-description"
            sx={{ marginBottom: 1 }}
          >
            Please provide a title for the product:
            <FormControl
              sx={{ m: 1, marginTop: 0, width: "23.5ch" }}
              variant="outlined"
            >
              <OutlinedInput
                required
                style={{ height: "1cm" }}
                id="outlined-adornment-title"
                onChange={(e) => setTitleOfNew(e.target.value)}
                inputProps={{
                  "aria-label": "Title",
                }}
              />
            </FormControl>
          </DialogContentText>
          <DialogContentText id="alert-dialog-slide-description">
            Please provide the wanted amount in Ether:
            <FormControl
              sx={{ m: 1, marginTop: 0, width: "18ch" }}
              variant="outlined"
            >
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
          <DialogContentText sx={{marginBottom: 1}}>Please upload your data:</DialogContentText>
          <DialogContentText>
            <form className="form" onSubmit={handleSubmit2}>
              <input type="file" multiple name="data" onChange={retrieveFile} />
              <Button type="submit" className="btn">
                Upload file
              </Button>
              <CircularProgress sx={{ visibility: hidden, marginLeft: 2, marginTop: -2}}/> 
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
    </>
  );
}
