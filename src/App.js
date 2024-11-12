import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import ABI from './CrossBorderPayment.json';

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [depositAmount, setDepositAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoadingDeposit, setIsLoadingDeposit] = useState(false);
  const [isLoadingTransfer, setIsLoadingTransfer] = useState(false);

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;


  useEffect(() => {
    const loadMetaMask = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          const deployedContract = new web3Instance.eth.Contract(ABI.abi, contractAddress);
          setContract(deployedContract);
          setMessage('MetaMask connected successfully!');
          setMessageType('success');
        } catch (error) {
          setMessage(`Error connecting to MetaMask: ${error.message}`);
          setMessageType('error');
        }
      } else {
        setMessage('Please install MetaMask!');
        setMessageType('warning');
      }
    };

    loadMetaMask();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
        setMessage(`Account changed to ${accounts[0]}`);
        setMessageType('info');
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleDeposit = async () => {
    if (!contract) {
      setMessage('Contract not loaded.');
      setMessageType('error');
      return;
    }

    setIsLoadingDeposit(true);

    try {
      const gasEstimate = await contract.methods.deposit().estimateGas({
        from: account,
        value: web3.utils.toWei(depositAmount, 'ether'),
      });

      await contract.methods.deposit().send({
        from: account,
        value: web3.utils.toWei(depositAmount, 'ether'),
        gas: gasEstimate,
      });

      setMessage('Deposit successful!');
      setMessageType('success');
    } catch (error) {
      setMessage(`Deposit failed: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsLoadingDeposit(false);
    }
  };

  const handleTransfer = async () => {
    if (!contract) {
      setMessage('Contract not loaded.');
      setMessageType('error');
      return;
    }

    setIsLoadingTransfer(true);

    try {
      const gasEstimate = await contract.methods
        .transferTo(recipient, web3.utils.toWei(transferAmount, 'ether'))
        .estimateGas({
          from: account,
        });

      await contract.methods
        .transferTo(recipient, web3.utils.toWei(transferAmount, 'ether'))
        .send({ from: account, gas: gasEstimate });

      setMessage('Transfer successful!');
      setMessageType('success');
    } catch (error) {
      setMessage(`Transfer failed: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsLoadingTransfer(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {message && <Alert severity={messageType}>{message}</Alert>}
      <Typography variant="h4">BridgePay</Typography>
      <Typography variant="h6">Connected Account: {account || 'No account connected'}</Typography>

      <div style={{ marginTop: '20px' }}>
        <TextField
          label="Deposit Amount (ETH)"
          variant="outlined"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          style={{ marginBottom: '10px', marginRight: '10px' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleDeposit}
          disabled={isLoadingDeposit}
          startIcon={isLoadingDeposit && <CircularProgress size={20} />}
        >
          {isLoadingDeposit ? 'Processing...' : 'Deposit'}
        </Button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <TextField
          label="Recipient Address"
          variant="outlined"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={{ marginBottom: '10px', marginRight: '10px' }}
        />
        <TextField
          label="Transfer Amount (ETH)"
          variant="outlined"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          style={{ marginBottom: '10px', marginRight: '10px' }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleTransfer}
          disabled={isLoadingTransfer}
          startIcon={isLoadingTransfer && <CircularProgress size={20} />}
        >
          {isLoadingTransfer ? 'Processing...' : 'Transfer'}
        </Button>
      </div>
    </div>
  );
}

export default App;
