// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expensesList = document.getElementById('expensesList');
const emptyState = document.getElementById('emptyState');
const totalExpenses = document.getElementById('totalExpenses');
const monthExpenses = document.getElementById('monthExpenses');
const budgetLeft = document.getElementById('budgetLeft');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const deleteAllBtn = document.getElementById('deleteAllBtn');

// State
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
const BUDGET = 5000; // Monthly budget

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTodayDate();
    renderExpenses();
    updateStats();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    expenseForm.addEventListener('submit', addExpense);
    searchInput.addEventListener('input', filterExpenses);
    filterCategory.addEventListener('change', filterExpenses);
    deleteAllBtn.addEventListener('click', deleteAllExpenses);
}

// Set today's date as default
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

// Add Expense
function addExpense(e) {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!description || amount <= 0) {
        alert('Please fill in all fields correctly!');
        return;
    }

    const expense = {
        id: Date.now(),
        description,
        amount,
        category,
        date,
        createdAt: new Date().toISOString()
    };

    expenses.push(expense);
    saveExpenses();
    renderExpenses();
    updateStats();

    // Clear form
    expenseForm.reset();
    setTodayDate();
    descriptionInput.focus();
}

// Delete Expense
function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses();
    renderExpenses();
    updateStats();
}

// Delete All Expenses
function deleteAllExpenses() {
    if (confirm('Are you sure you want to delete all expenses?')) {
        expenses = [];
        saveExpenses();
        renderExpenses();
        updateStats();
    }
}

// Render Expenses
function renderExpenses() {
    expensesList.innerHTML = '';

    if (expenses.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    // Sort by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedExpenses.forEach(expense => {
        const li = document.createElement('div');
        li.className = 'expense-item';

        const expenseDate = new Date(expense.date).toLocaleDateString();

        li.innerHTML = `
            <div class="expense-info">
                <div class="expense-description">${escapeHtml(expense.description)}</div>
                <div class="expense-meta">
                    <span class="expense-category">${expense.category}</span>
                    <span class="expense-date">${expenseDate}</span>
                </div>
            </div>
            <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            <button class="btn-delete" onclick="deleteExpense(${expense.id})">Delete</button>
        `;

        expensesList.appendChild(li);
    });
}

// Filter Expenses
function filterExpenses() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;

    const filtered = expenses.filter(expense => {
        const matchSearch = expense.description.toLowerCase().includes(searchTerm);
        const matchCategory = selectedCategory === '' || expense.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    // Display filtered expenses
    expensesList.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    filtered.forEach(expense => {
        const li = document.createElement('div');
        li.className = 'expense-item';

        const expenseDate = new Date(expense.date).toLocaleDateString();

        li.innerHTML = `
            <div class="expense-info">
                <div class="expense-description">${escapeHtml(expense.description)}</div>
                <div class="expense-meta">
                    <span class="expense-category">${expense.category}</span>
                    <span class="expense-date">${expenseDate}</span>
                </div>
            </div>
            <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            <button class="btn-delete" onclick="deleteExpense(${expense.id})">Delete</button>
        `;

        expensesList.appendChild(li);
    });
}

// Update Stats
function updateStats() {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate current month expenses
    const now = new Date();
    const currentMonth = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    });
    const monthTotal = currentMonth.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = BUDGET - monthTotal;

    totalExpenses.textContent = `$${total.toFixed(2)}`;
    monthExpenses.textContent = `$${monthTotal.toFixed(2)}`;
    budgetLeft.textContent = `$${remaining.toFixed(2)}`;
    
    deleteAllBtn.disabled = expenses.length === 0;
}

// Save Expenses to Local Storage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}