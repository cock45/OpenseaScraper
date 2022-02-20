import {
  Box,
  Link,
  Grid,
  List,
  Stack,
  Popover,
  ListItem,
  ListSubheader,
  CardActionArea,
  Typography,
  Modal,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Dialog,
  Button
} from '@material-ui/core';
import { useEffect, useState } from 'react';
import { connectWallet } from '../utils/interact';
// ----------------------------------------------------------------------
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};
export default function ConnectWalletButton() {
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState('');
  const [modalopen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  // useEffect(async () => {
  //   const walletResponse = await connectWallet();
  //   if (walletResponse.success === true) {
  //     addWalletListener();
  //   } else {
  //     setStatus(walletResponse.status);
  //     // setModalOpen(true);
  //   }
  //   setWalletAddress(walletResponse.address);
  // }, []);

  const handleClose = () => {
    setOpen(false);
  };
  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setStatus('👆🏽 Write a message in the text-field above.');
        } else {
          setWalletAddress('');
          setStatus('🦊 Connect to Metamask using the above button.');
        }
      });
    } else {
      setStatus(
        <p>
          {' '}
          🦊{' '}
          <a target="_blank" rel="noopener noreferrer" href="https://metamask.io/download.html">
            You must install Metamask, a virtual Ethereum wallet, in your browser.
          </a>
        </p>
      );
    }
  }
  async function handleOnConnectWallet(e) {
    e.preventDefault();
    // console.log('connect Wallet clicked:');
    const walletResponse = await connectWallet();
    console.log('handleOnConnectWallet:=>', walletResponse);
    if (walletResponse.success === true) {
      addWalletListener();
    } else {
      setStatus(walletResponse.status);
      setOpen(true);
    }
    setWalletAddress(walletResponse.address);
  }
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">You don't have Metamask in your Browser.</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{status}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Button variant="contained" onClick={handleOnConnectWallet}>
        {walletAddress.length > 0
          ? `${String(walletAddress).substring(0, 6)}...${String(walletAddress).substring(38)}`
          : 'Connect Wallet'}
      </Button>
    </>
  );
}
