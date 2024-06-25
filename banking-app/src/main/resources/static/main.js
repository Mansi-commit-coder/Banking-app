document.addEventListener("DOMContentLoaded", function() {
    const accountForm = document.getElementById("accountForm");
    const accountsList = document.getElementById("accountsList");
    const accountHolderNameInput = document.getElementById("accountHolderName");
    const balanceInput = document.getElementById("balance");

    // Fetch and display all accounts on page load
    fetchAccounts();

    // Handle form submission for creating new account
    accountForm.addEventListener("submit", function(event) {
        event.preventDefault();
        createAccount(accountHolderNameInput.value, balanceInput.value);
    });

    function createAccount(accountHolderName, balance) {
        fetch("/api/accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accountHolderName: accountHolderName,
                balance: parseFloat(balance)
            })
        })
            .then(response => response.json())
            .then(data => {
                appendAccountToList(data);
                accountHolderNameInput.value = "";
                balanceInput.value = "";
            })
            .catch(error => console.error("Error creating account:", error));
    }

    function fetchAccounts() {
        fetch("/api/accounts")
            .then(response => response.json())
            .then(data => {
                accountsList.innerHTML = "";
                data.forEach(account => appendAccountToList(account));
            })
            .catch(error => console.error("Error fetching accounts:", error));
    }

    function appendAccountToList(account) {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        listItem.innerHTML = `
            <div>
                <strong>${account.accountHolderName}</strong>
                <br>
                Balance: $${account.balance.toFixed(2)}
            </div>
            <div>
                <button class="btn btn-sm btn-success mr-2" onclick="deposit(${account.id})">Deposit</button>
                <button class="btn btn-sm btn-warning mr-2" onclick="withdraw(${account.id})">Withdraw</button>
                <button class="btn btn-sm btn-danger delete-btn" onclick="deleteAccount(${account.id})">Delete</button>
            </div>
        `;
        accountsList.appendChild(listItem);
    }

    window.deposit = function(accountId) {
        const amount = prompt("Enter amount to deposit:");
        if (amount && !isNaN(amount)) {
            fetch(`/api/accounts/${accountId}/deposit`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ amount: parseFloat(amount) })
            })
                .then(response => response.json())
                .then(data => {
                    fetchAccounts();
                })
                .catch(error => console.error("Error depositing money:", error));
        } else {
            alert("Invalid amount.");
        }
    };

    window.withdraw = function(accountId) {
        const amount = prompt("Enter amount to withdraw:");
        if (amount && !isNaN(amount)) {
            fetch(`/api/accounts/${accountId}/withdraw`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ amount: parseFloat(amount) })
            })
                .then(response => response.json())
                .then(data => {
                    fetchAccounts();
                })
                .catch(error => console.error("Error withdrawing money:", error));
        } else {
            alert("Invalid amount.");
        }
    };

    window.deleteAccount = function(accountId) {
        if (confirm("Are you sure you want to delete this account?")) {
            fetch(`/api/accounts/${accountId}`, {
                method: "DELETE"
            })
                .then(() => {
                    fetchAccounts();
                })
                .catch(error => console.error("Error deleting account:", error));
        }
    };
});
