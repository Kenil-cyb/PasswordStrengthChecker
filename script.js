document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordInput = document.getElementById('passwordInput');
    const toggleVisibility = document.getElementById('toggleVisibility');
    const strengthBar = document.getElementById('strengthBar');
    const strengthLabel = document.getElementById('strengthLabel');
    const suggestions = document.getElementById('suggestions');
    const generatePasswordBtn = document.getElementById('generatePassword');
    const savePasswordBtn = document.getElementById('savePassword');
    const passwordVault = document.getElementById('passwordVault');
    const vaultIdentifier = document.getElementById('vaultIdentifier');
    const addToVaultBtn = document.getElementById('addToVault');
    const vaultList = document.getElementById('vaultList');
  
    // Password rules elements
    const lengthRule = document.getElementById('lengthRule');
    const uppercaseRule = document.getElementById('uppercaseRule');
    const lowercaseRule = document.getElementById('lowercaseRule');
    const numberRule = document.getElementById('numberRule');
    const specialRule = document.getElementById('specialRule');
  
    // Toggle password visibility
    let isPasswordVisible = false;
    toggleVisibility.addEventListener('click', function() {
      isPasswordVisible = !isPasswordVisible;
      passwordInput.type = isPasswordVisible ? 'text' : 'password';
      toggleVisibility.textContent = isPasswordVisible ? '🙈' : '👁️';
    });
  
    // Check password strength in real-time
    passwordInput.addEventListener('input', checkPasswordStrength);
  
    // Generate strong password
    generatePasswordBtn.addEventListener('click', generateStrongPassword);
  
    // Save password to vault
    savePasswordBtn.addEventListener('click', function() {
      passwordVault.classList.remove('hidden');
      passwordInput.select();
    });
  
    // Add password to vault
    addToVaultBtn.addEventListener('click', addPasswordToVault);
  
    // Load saved passwords from localStorage
    loadPasswordVault();
  
    function checkPasswordStrength() {
      const password = passwordInput.value;
      let strength = 0;
      let suggestionMessages = [];
  
      // Reset rules
      lengthRule.classList.remove('valid');
      uppercaseRule.classList.remove('valid');
      lowercaseRule.classList.remove('valid');
      numberRule.classList.remove('valid');
      specialRule.classList.remove('valid');
  
      // Check length (min 12 characters)
      if (password.length >= 12) {
        strength += 1;
        lengthRule.classList.add('valid');
      } else {
        suggestionMessages.push(`Add ${12 - password.length} more characters`);
      }
  
      // Check for uppercase letters
      if (/[A-Z]/.test(password)) {
        strength += 1;
        uppercaseRule.classList.add('valid');
      } else {
        suggestionMessages.push('Add uppercase letters (A-Z)');
      }
  
      // Check for lowercase letters
      if (/[a-z]/.test(password)) {
        strength += 1;
        lowercaseRule.classList.add('valid');
      } else {
        suggestionMessages.push('Add lowercase letters (a-z)');
      }
  
      // Check for numbers
      if (/\d/.test(password)) {
        strength += 1;
        numberRule.classList.add('valid');
      } else {
        suggestionMessages.push('Add numbers (0-9)');
      }
  
      // Check for special characters
      if (/[^A-Za-z0-9]/.test(password)) {
        strength += 1;
        specialRule.classList.add('valid');
      } else {
        suggestionMessages.push('Add special characters (!@#$%^&*)');
      }
  
      // Check for common patterns (bonus)
      if (/(.)\1{2,}/.test(password)) {
        suggestionMessages.push('Avoid repeating characters');
      }
      if (/123|abc|qwerty|password/i.test(password)) {
        suggestionMessages.push('Avoid common patterns');
      }
  
      // Update strength meter
      const width = (strength / 5) * 100;
      strengthBar.style.width = `${width}%`;
      strengthBar.className = 'strength-bar strength-' + strength;
  
      // Update strength label
      const strengthText = [
        'Very Weak',
        'Weak',
        'Medium',
        'Strong',
        'Very Strong'
      ][strength] || 'Very Weak';
      strengthLabel.textContent = strengthText;
      strengthLabel.className = 'strength-label strength-' + strength;
  
      // Update suggestions
      if (suggestionMessages.length > 0 && password.length > 0) {
        suggestions.innerHTML = '<strong>Suggestions:</strong> ' + 
          suggestionMessages.join(', ');
      } else {
        suggestions.innerHTML = '';
      }
  
      // Enable/disable save button
      savePasswordBtn.disabled = strength < 3 || password.length === 0;
    }
  
    function generateStrongPassword() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
      let password = '';
      
      // Ensure at least one of each character type
      password += getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // Uppercase
      password += getRandomChar('abcdefghijklmnopqrstuvwxyz'); // Lowercase
      password += getRandomChar('0123456789'); // Number
      password += getRandomChar('!@#$%^&*()_+'); // Special
      
      // Fill remaining characters
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Shuffle the password
      password = password.split('').sort(() => 0.5 - Math.random()).join('');
      
      passwordInput.value = password;
      passwordInput.type = 'text';
      toggleVisibility.textContent = '🙈';
      isPasswordVisible = true;
      checkPasswordStrength();
    }
  
    function getRandomChar(charSet) {
      return charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
  
    function addPasswordToVault() {
      const identifier = vaultIdentifier.value.trim();
      const password = passwordInput.value;
      
      if (!identifier || !password) {
        alert('Please enter both an account name and password');
        return;
      }
      
      const vault = JSON.parse(localStorage.getItem('passwordVault')) || [];
      vault.push({ identifier, password });
      localStorage.setItem('passwordVault', JSON.stringify(vault));
      
      vaultIdentifier.value = '';
      loadPasswordVault();
    }
  
    function loadPasswordVault() {
      const vault = JSON.parse(localStorage.getItem('passwordVault')) || [];
      vaultList.innerHTML = '';
      
      if (vault.length === 0) {
        vaultList.innerHTML = '<li>No passwords saved yet</li>';
        return;
      }
      
      vault.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="vault-item-name">${item.identifier}</span>
          <span class="vault-item-password">••••••••</span>
          <span class="vault-item-actions">
            <button class="show-password" data-password="${item.password}">👁️</button>
            <button class="delete-password" data-id="${item.identifier}">🗑️</button>
          </span>
        `;
        vaultList.appendChild(li);
      });
      
      // Add event listeners for the new buttons
      document.querySelectorAll('.show-password').forEach(btn => {
        btn.addEventListener('click', function() {
          const password = this.getAttribute('data-password');
          this.parentNode.previousElementSibling.textContent = password;
          setTimeout(() => {
            this.parentNode.previousElementSibling.textContent = '••••••••';
          }, 3000);
        });
      });
      
      document.querySelectorAll('.delete-password').forEach(btn => {
        btn.addEventListener('click', function() {
          const identifier = this.getAttribute('data-id');
          if (confirm(`Delete password for ${identifier}?`)) {
            const vault = JSON.parse(localStorage.getItem('passwordVault')) || [];
            const updatedVault = vault.filter(item => item.identifier !== identifier);
            localStorage.setItem('passwordVault', JSON.stringify(updatedVault));
            loadPasswordVault();
          }
        });
      });
    }
  });