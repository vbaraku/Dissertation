import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { ethers } from "ethers";
import Input from "@mui/material/Input";

import DialogContentText from "@mui/material/DialogContentText";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import EthCrypto from 'eth-crypto';

function EncryptionTools() {
  var aesjs = require("aes-js");

  const [images, setImages] = React.useState({
    files: [],
  });

  const [keys, setKeys] = React.useState({
    files: [],
  });

  const retrieveFile = (e) => {
    console.log(e.target.files);
    setImages({ files: [...images.files, ...e.target.files] });
  };

  const retrieveKeys = (e) => {
    console.log(e.target.files);
    setKeys({ files: [...keys.files, ...e.target.files] });
  };

  async function encryptAES() {
    let keysArray = new Array();
    let encryptedFilesArray = new Array();
    await Promise.all(
      images.files.map(async (element) => {
        const key = new Uint8Array(16);
        window.crypto.getRandomValues(key);
        const buffer = new Uint8Array(await element.arrayBuffer());
        const ctr = new aesjs.ModeOfOperation.ctr(key);
        const encryptedFile = ctr.encrypt(buffer);
        const encryptedFileHex = aesjs.utils.hex.fromBytes(encryptedFile);
        var keyHex = aesjs.utils.hex.fromBytes(key);
        keysArray.push(keyHex);
        encryptedFilesArray.push(encryptedFileHex);
      })
    );
    alert(
      "Files encrypted and will be downloaded. Keys file holds the keys, and each file keeps the index originally uploaded."
    );
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(keysArray)
    );
    element.setAttribute("download", "Keys");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    encryptedFilesArray.forEach((hex, index) => {
      var element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(hex)
      );
      element.setAttribute("download", index);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
    window.location.reload();
  }

  async function decryptAES() {
    const key = await keys.files[0].text();
    let keyArray = key.split(",");
    let decryptedFilesArray = new Array();
    await Promise.all(
      images.files.map(async (element, index) => {
        const fileBytes = new aesjs.utils.hex.toBytes(await element.text());
        const ctr = new aesjs.ModeOfOperation.ctr(
          aesjs.utils.hex.toBytes(keyArray[index])
        );
        const decryptedFile = ctr.decrypt(fileBytes);
        decryptedFilesArray.push(decryptedFile);
      })
    );
    alert("Files decrypted and will be downloaded.");

    decryptedFilesArray.forEach((hex, index) => {
      const blob = new Blob([hex], { type: "image/png" });
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, index);
      } else {
        const elem = window.document.createElement("a");
        elem.href = window.URL.createObjectURL(blob);
        elem.download = index;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
    });
    window.location.reload();
  }

  //NOTE CHANGE HASH AT VIEWDETAILS (REMOX 0X)
  async function hash() {
    const key = await keys.files[0].text();
    let hashedKeys = new Array();
    let keyArray = key.split(",");
    keyArray.forEach((el) => {
      const hashKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(el));
      hashedKeys.push(hashKey);
    });
    console.log(hashedKeys);
    alert(
      "Keys hashed and will be downloaded"
    );
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(hashedKeys)
    );
    element.setAttribute("download", "KeysHashed");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    window.location.reload();
  }

  async function encryptEcies() {
    const key = await keys.files[0].text();
    const pk = document.getElementById("publicKey").value;
    let encryptedKeys = new Array();
    let keyArray = key.split(",");

    await Promise.all(
      keyArray.map(async (el) => {
        const encrypted = await EthCrypto.encryptWithPublicKey(pk,el);
        const stringEncrypted = EthCrypto.cipher.stringify(encrypted);
        encryptedKeys.push(stringEncrypted);
      })
    );
    console.log(encryptedKeys);
    alert(
      "Keys encrypted with public key and will be downloaded"
    );
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(encryptedKeys)
    );
    element.setAttribute("download", "KeysPublicK");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    window.location.reload();
  }

  async function decryptEcies() {
    const key = await keys.files[0].text();
    const pk = document.getElementById("privateKey").value;
    let decryptedKeys = new Array();
    let keyArray = key.split(",");

    await Promise.all(
      keyArray.map(async (el) => {
        const parsed = EthCrypto.cipher.parse(el)
        const decrypted = await EthCrypto.decryptWithPrivateKey(pk,parsed);
        decryptedKeys.push(decrypted);
      })
    );
    console.log(decryptedKeys);
    alert(
      "Keys decrypted with private key and will be downloaded"
    );
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(decryptedKeys)
    );
    element.setAttribute("download", "Keys");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    window.location.reload();
  }


  return (
    <div className="App">
      <div className="App-header">
        <Grid spacing={2} style={{ height: "100vh", display: "flex"}}>
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
          <Grid item xs={10} sx={{display: "flex", flexWrap:"wrap"}}>
            <Card sx={{ minWidth: 275 ,margin: 2, height: 250}}>
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  AES Encryption
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Upload images to encrypt:
                </Typography>
                <DialogContentText>
                  Please upload your data:
                  <br></br>
                  <input
                    type="file"
                    multiple
                    name="data"
                    onChange={retrieveFile}
                  />
                </DialogContentText>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={encryptAES}>
                  Encrypt images
                </Button>
              </CardActions>
            </Card>

            <Card sx={{ minWidth: 275 , margin: 2, height: 250}}>
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  AES Decryption
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Upload images to decrypt:
                </Typography>
                <DialogContentText>
                  Please upload your data:
                  <br></br>
                  <input
                    type="file"
                    multiple
                    name="data"
                    onChange={retrieveFile}
                  />
                </DialogContentText>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Upload keys to decrypt:
                </Typography>
                <DialogContentText>
                  <input
                    type="file"
                    multiple
                    name="data"
                    onChange={retrieveKeys}
                  />
                </DialogContentText>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={decryptAES}>
                  Decrypt images
                </Button>
              </CardActions>
            </Card>

            <Card sx={{ minWidth: 275 , margin: 2, height: 250}}>
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  ECIES Encrypt
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Upload keys to encrypt:
                </Typography>
                <DialogContentText>
                  <input
                    type="file"
                    multiple
                    name="data"
                    onChange={retrieveKeys}
                  />
                </DialogContentText>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Provide the public key:
                </Typography>
                <DialogContentText>
                  <Input id="publicKey"></Input>
                </DialogContentText>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={encryptEcies}>
                  Encrypt keys
                </Button>
              </CardActions>
            </Card>

            <Card sx={{ minWidth: 275 , margin: 2, height: 250}}>
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  ECIES Decrypt
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Upload keys to decrypt:
                </Typography>
                <DialogContentText>
                  <input
                    type="file"
                    multiple
                    name="data"
                    onChange={retrieveKeys}
                  />
                </DialogContentText>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Provide your private key:
                </Typography>
                <DialogContentText>
                  <Input id="privateKey"></Input>
                </DialogContentText>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={decryptEcies}>
                  Decrypt keys
                </Button>
              </CardActions>
            </Card>

            <Card sx={{ minWidth: 275 ,margin: 2, height: 250}}>
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  Keccak256 hashing
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Upload keys to hash:
                </Typography>
                <DialogContentText>
                  <input
                    type="file"
                    multiple
                    name="data"
                    onChange={retrieveKeys}
                  />
                </DialogContentText>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={hash}>
                  Hash keys
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
export default EncryptionTools;
