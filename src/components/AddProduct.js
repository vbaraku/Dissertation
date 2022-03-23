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

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import FilledInput from "@mui/material/FilledInput";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddProduct() {
  const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [open, setOpen] = React.useState(false);

  const [values, setValues] = React.useState({
    amount: "",
  });
  

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
    console.log(values);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  const handleSubmit = async () => {
    if (!values.amount) return;
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
          ethers.utils.parseEther(values.amount)
        );
        await transaction.wait();
      } catch (error) {
        alert("There was an error");
        console.log(error);
      }
    }
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
                id="outlined-adornment-amount"
                value={values.amount}
                onChange={handleChange("amount")}
                endAdornment={
                  <InputAdornment position="end">ETH</InputAdornment>
                }
                inputProps={{
                  "aria-label": "price",
                }}
              />
            </FormControl>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
