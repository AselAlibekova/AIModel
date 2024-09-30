let web3;
let contract;
const contractAddress = '0x2a0b84aa669089E07C93b9371D2fD8bc25A235CB'; // Адрес вашего смарт-контракта
const contractABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "string", "name": "description", "type": "string"},
            {"internalType": "uint256", "name": "price", "type": "uint256"}
        ],
        "name": "listModel",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllModels",
        "outputs": [
            {"internalType": "string[]", "name": "names", "type": "string[]"},
            {"internalType": "string[]", "name": "descriptions", "type": "string[]"},
            {"internalType": "uint256[]", "name": "prices", "type": "uint256[]"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // Запрос доступа к аккаунту MetaMask
        contract = new web3.eth.Contract(contractABI, contractAddress);

        // Загружаем модели при загрузке страницы
        loadModels();
    } else {
        alert('Please install MetaMask!');
    }
});

async function listModel() {
    const name = document.getElementById('modelName').value;
    const description = document.getElementById('modelDescription').value;
    const price = document.getElementById('modelPrice').value;

    if (!name || !description || !price || price <= 0) {
        alert("Please fill out all fields with valid values.");
        return;
    }

    const accounts = await web3.eth.getAccounts();
    
    try {
        await contract.methods.listModel(name, description, web3.utils.toWei(price, 'ether')).send({ from: accounts[0] });
        alert("Model listed successfully!");
        loadModels(); // Обновляем список моделей
    } catch (error) {
        alert("Transaction failed: " + error.message);
    }

    // Очищаем поля после успешного добавления
    document.getElementById('modelName').value = '';
    document.getElementById('modelDescription').value = '';
    document.getElementById('modelPrice').value = '';
}

async function loadModels() {
    // Получаем информацию о моделях
    try {
        const modelData = await contract.methods.getAllModels().call();
        const names = modelData[0];
        const descriptions = modelData[1];
        const prices = modelData[2];
        
        const modelsListDiv = document.getElementById('modelsList');
        modelsListDiv.innerHTML = ''; // Очищаем список перед добавлением новых данных
        
        for (let i = 0; i < names.length; i++) {
            const priceInEth = web3.utils.fromWei(prices[i], 'ether'); // Конвертируем цену из Wei в ETH
            modelsListDiv.innerHTML += `
                <div>
                    <h3>${names[i]}</h3>
                    <p>${descriptions[i]}</p>
                    <p>Price: ${priceInEth} ETH</p>
                </div>
                <hr>
            `;
        }
    } catch (error) {
        console.error("Failed to load models: ", error);
    }
}


async function purchaseModel(modelId) {
    const accounts = await web3.eth.getAccounts();
    const model = await contract.methods.models(modelId).call();

    try {
        await contract.methods.purchaseModel(modelId).send({
            from: accounts[0],
            value: model.price
        });
        alert("Model purchased successfully!");
        loadModels();
    } catch (error) {
        alert("Transaction failed: " + error.message);
    }
}

async function rateModel(modelId) {
    const rating = document.getElementById(`rating-${modelId}`).value;

    if (rating < 1 | rating > 5) {
        alert("Please enter a valid rating (1-5).");
        return;
    }

    const accounts = await web3.eth.getAccounts();
    try {
        await contract.methods.rateModel(modelId, rating).send({ from: accounts[0] });
        alert("Model rated successfully!");
        loadModels();
    } catch (error) {
        alert("Transaction failed: " + error.message);
    }
}

async function withdrawFunds() {
    const accounts = await web3.eth.getAccounts();
    try {
        await contract.methods.withdrawFunds().send({ from: accounts[0] });
        alert("Funds withdrawn successfully!");
    } catch (error) {
        alert("Transaction failed: " + error.message);
    }
}



// Функция для обновления списка моделей
function updateModelList() {
    const modelsListDiv = document.getElementById('modelsList');
    modelsListDiv.innerHTML = ''; // Очищаем текущий список

    models.forEach((model, index) => {
        const modelDiv = document.createElement('div');
        modelDiv.innerHTML = `
            <strong>Model #${index + 1}</strong><br>
            Name: ${model.name}<br>
            Description: ${model.description}<br>
            Price: ${model.price} ETH
            <hr>
        `;
        modelsListDiv.appendChild(modelDiv);
    });
}
