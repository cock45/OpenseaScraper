import React, { useState } from 'react';
import { styled, useTheme } from '@material-ui/core/styles';
import { Stack, TextField, Button } from '@material-ui/core';
// hooks
// ----------------------------------------------------------------------

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});
export default function WalletProfile() {
  const [address, setAddress] = React.useState('0X...');
  const handleChange = (event) => {
    setAddress(event.target.value);
  };
  const handleOnClick = (e) => {
    e.preventDefault();
    console.log('walletProfile=>onHandleClick=', address);
  };
  return (
    <RootStyle>
      <Stack direction="column" spacing={2} sx={{ minWidth: 400 }}>
        <Stack> Wallet Address </Stack>
        <Stack>
          <TextField id="outlined-name" label="Address" value={address} onChange={handleChange} />
        </Stack>
        <Stack>
          <Button variant="contained" onClick={handleOnClick}>
            Show Wallet Data
          </Button>
        </Stack>
      </Stack>
    </RootStyle>
  );
}
