import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import DialogContentText from "@mui/material/DialogContentText";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

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
        const fileBytes = aesjs.utils.utf8.toBytes(await element.text())
        const testHex = aesjs.utils.hex.fromBytes(fileBytes);
        console.log("Unecrypted hex:");
        console.log(testHex);
        const ctr = new aesjs.ModeOfOperation.ctr(key);
        const encryptedFile = ctr.encrypt(fileBytes);
        var encryptedFileHex = aesjs.utils.hex.fromBytes(encryptedFile);
        var keyHex = aesjs.utils.hex.fromBytes(key);
        keysArray.push(keyHex);
        encryptedFilesArray.push(encryptedFileHex)
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
  }

  async function decryptAES() {
    const key = await keys.files[0].text();
    let keyArray = key.split(",");
    console.log("Key array")
    console.log(keyArray);
    let decryptedFilesArray = new Array();
    await Promise.all(
      images.files.map(async (element, index) => {
        
        const fileBytes = aesjs.utils.hex.toBytes(await element.text());
        console.log(fileBytes)
        console.log("here1");
        const ctr = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(keyArray[index]));
        console.log("here2");
        const decryptedFile = ctr.decrypt(fileBytes);
        console.log("here3");
        const decryptedFileHex = aesjs.utils.hex.fromBytes(decryptedFile);
        console.log("here4");
        console.log("Decrypted Hex:");
        console.log(decryptedFileHex);
        decryptedFilesArray.push(decryptedFileHex);
      })
    );

  }

  return (
    <div className="App">
      <div className="App-header">
        <Grid spacing={2} style={{ height: "100vh", display: "flex" }}>
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
          <Grid item xs={10}>
            <Card sx={{ minWidth: 275 }}>
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

            <Card sx={{ minWidth: 275 }}>
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
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
export default EncryptionTools;
