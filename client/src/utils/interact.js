export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const obj = {
        status: '👆🏽 Write a message in the text-field above.',
        address: addressArray[0],
        success: true
      };
      return obj;
    } catch (err) {
      return {
        address: '',
        status: `😥 ${err.message}`,
        success: false
      };
    }
  } else {
    return {
      address: '',
      success: false,
      status: (
        <span>
          <p>
            {' '}
            🦊{' '}
            <a rel="noreferrer" target="_blank" href="https://metamask.io/download.html">
              You must install Metamask, a virtual Ethereum wallet, in your browser.
            </a>
          </p>
        </span>
      )
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_accounts'
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: '👆🏽 Write a message in the text-field above.'
        };
      }
      return {
        address: '',
        status: '🦊 Connect to Metamask using the top right button.'
      };
    } catch (err) {
      return { address: '', status: `😥 ${err.message}` };
    }
  } else {
    return {
      address: '',
      status: (
        <span>
          <p>
            {' '}
            🦊{' '}
            <a rel="noreferrer" target="_blank" href="https://metamask.io/download.html">
              You must install Metamask, a virtual Ethereum wallet, in your browser.
            </a>
          </p>
        </span>
      )
    };
  }
};
