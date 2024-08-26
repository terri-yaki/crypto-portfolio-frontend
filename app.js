let account;

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            account = accounts[0];
            document.getElementById('accountAddress').innerText = account;
            document.getElementById('accountInfo').style.display = 'block';
            getNetwork();
            getBalances();
        } catch (error) {
            console.error("User rejected connection", error);
        }
    } else {
        alert("Please install MetaMask!");
    }
}

async function getNetwork() {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    let networkName;

    if (networkId === 11155111) { // Sepolia testnet network ID
        networkName = "Sepolia Testnet";
    }

    document.getElementById('network').innerText = networkName;
}

async function getBalances() {
    const web3 = new Web3(window.ethereum);
    
    const ethBalance = await web3.eth.getBalance(account);
    document.getElementById('ethBalance').innerText = web3.utils.fromWei(ethBalance, 'ether');

    const usdcContract = new web3.eth.Contract(ERC20_ABI, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'); // USDC Mainnet
    const usdcBalance = await usdcContract.methods.balanceOf(account).call();
    document.getElementById('usdcBalance').innerText = web3.utils.fromWei(usdcBalance, 'mwei');

    const usdtContract = new web3.eth.Contract(ERC20_ABI, '0xdAC17F958D2ee523a2206206994597C13D831ec7'); // USDT Mainnet
    const usdtBalance = await usdtContract.methods.balanceOf(account).call();
    document.getElementById('usdtBalance').innerText = web3.utils.fromWei(usdtBalance, 'mwei');
}

async function sendTransaction() {
    const web3 = new Web3(window.ethereum);
    const asset = document.getElementById('asset').value;
    const amount = document.getElementById('amount').value;
    const recipient = document.getElementById('recipient').value;

    let transaction;
    
    if (asset === 'ETH') {
        const value = web3.utils.toWei(amount, 'ether');
        transaction = web3.eth.sendTransaction({
            from: account,
            to: recipient,
            value: value
        });
    } else {
        const contractAddress = asset === 'USDC' ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' : '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        const contract = new web3.eth.Contract(ERC20_ABI, contractAddress);
        const value = web3.utils.toWei(amount, 'mwei'); // assuming 6 decimals for USDC/USDT
        transaction = contract.methods.transfer(recipient, value).send({ from: account });
    }

    transaction
        .on('transactionHash', function(hash) {
            console.log('Transaction sent:', hash);
        })
        .on('confirmation', function(confirmationNumber, receipt) {
            console.log('Transaction confirmed:', receipt);
        })
        .on('error', function(error) {
            console.error('Transaction error:', error);
        });
}

document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('sendTransaction').addEventListener('click', sendTransaction);

// ERC20 ABI
const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    }
];
