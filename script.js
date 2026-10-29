<!-- JavaScript Logic -->
    <>
        // Calculator State
        let currentInput = '0';
        let previousInput = null;
        let operator = null;
        let memoryValue = 0;
        let shouldResetDisplay = false;
        let isResultDisplayed = false;

        // DOM Element Handles
        const mainDisplay = document.getElementById('mainDisplay');
        const expressionDisplay = document.getElementById('expressionDisplay');

        // Helper to format display symbols for expression bar
        function getOperatorSymbol(op) {
            switch(op) {
                case '+': return '+';
                case '-': return '−';
                case '*': return '×';
                case '/': return '÷';
                default: return '';
            }
        }

        // Format number strings for clean presentation
        function formatNumber(numStr) {
            if (numStr === 'Error' || numStr === 'Cannot divide by zero') return numStr;
            const num = parseFloat(numStr);
            if (isNaN(num)) return '0';
            
            // Limit maximum visible length
            if (numStr.length > 12) {
                return num.toPrecision(8).toString();
            }
            return numStr;
        }

        // Update UI displays
        function updateDisplay() {
            mainDisplay.innerText = formatNumber(currentInput);
            
            if (operator && previousInput !== null) {
                expressionDisplay.innerText = `${previousInput} ${getOperatorSymbol(operator)}`;
            } else if (!operator && isResultDisplayed && expressionDisplay.innerText) {
                // Keep expression as is until next action
            } else {
                expressionDisplay.innerText = '';
            }
        }

        // Append digit input
        function appendDigit(digit) {
            if (currentInput === '0' || shouldResetDisplay) {
                currentInput = digit;
                shouldResetDisplay = false;
            } else {
                if (currentInput.length < 12) {
                    currentInput += digit;
                }
            }
            isResultDisplayed = false;
            updateDisplay();
        }

        // Append decimal point
        function appendDecimal() {
            if (shouldResetDisplay) {
                currentInput = '0.';
                shouldResetDisplay = false;
                updateDisplay();
                return;
            }
            if (!currentInput.includes('.')) {
                currentInput += '.';
                updateDisplay();
            }
        }

        // Toggle positive/negative sign
        function toggleSign() {
            if (currentInput === '0' || currentInput === 'Error') return;
            currentInput = (parseFloat(currentInput) * -1).toString();
            updateDisplay();
        }

        // Handle mathematical operator input
        function handleOperator(nextOperator) {
            if (currentInput === 'Error') return;

            if (operator && !shouldResetDisplay) {
                calculateResult(false);
            }

            previousInput = currentInput;
            operator = nextOperator;
            shouldResetDisplay = true;
            isResultDisplayed = false;

            expressionDisplay.innerText = `${previousInput} ${getOperatorSymbol(operator)}`;
        }

        // Calculate arithmetic expression
        function calculateResult(isFinal = true) {
            if (operator === null || previousInput === null) return;

            const prev = parseFloat(previousInput);
            const current = parseFloat(currentInput);
            let result = 0;

            switch (operator) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    if (current === 0) {
                        currentInput = 'Error';
                        expressionDisplay.innerText = `${previousInput} ÷ 0 =`;
                        operator = null;
                        previousInput = null;
                        shouldResetDisplay = true;
                        updateDisplay();
                        return;
                    }
                    result = prev / current;
                    break;
            }

            // Round float inaccuracies (e.g. 0.1 + 0.2)
            result = Math.round(result * 1e10) / 1e10;

            if (isFinal) {
                expressionDisplay.innerText = `${previousInput} ${getOperatorSymbol(operator)} ${currentInput} =`;
                operator = null;
                previousInput = null;
                isResultDisplayed = true;
            } else {
                previousInput = result.toString();
            }

            currentInput = result.toString();
            shouldResetDisplay = true;
            updateDisplay();
        }

        // Handle single-operand functions (1/x, x², √x, %)
        function handleFunction(func) {
            if (currentInput === 'Error') return;
            const val = parseFloat(currentInput);
            let res = 0;

            switch (func) {
                case 'reciprocal':
                    if (val === 0) {
                        currentInput = 'Error';
                        updateDisplay();
                        return;
                    }
                    res = 1 / val;
                    expressionDisplay.innerText = `1/(${currentInput})`;
                    break;
                case 'square':
                    res = val * val;
                    expressionDisplay.innerText = `sqr(${currentInput})`;
                    break;
                case 'sqrt':
                    if (val < 0) {
                        currentInput = 'Error';
                        updateDisplay();
                        return;
                    }
                    res = Math.sqrt(val);
                    expressionDisplay.innerText = `√(${currentInput})`;
                    break;
                case '%':
                    res = val / 100;
                    expressionDisplay.innerText = `${currentInput}%`;
                    break;
            }

            currentInput = (Math.round(res * 1e10) / 1e10).toString();
            shouldResetDisplay = true;
            updateDisplay();
        }

        // Backspace operation
        function handleBackspace() {
            if (shouldResetDisplay || currentInput === 'Error') return;
            if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
                currentInput = '0';
            } else {
                currentInput = currentInput.slice(0, -1);
            }
            updateDisplay();
        }

        // Clear Entry (CE)
        function clearEntry() {
            currentInput = '0';
            updateDisplay();
        }

        // Clear All (C)
        function clearAll() {
            currentInput = '0';
            previousInput = null;
            operator = null;
            shouldResetDisplay = false;
            isResultDisplayed = false;
            expressionDisplay.innerText = '';
            updateDisplay();
        }

        // Memory Operations
        function handleMemory(action) {
            const val = parseFloat(currentInput);
            if (isNaN(val) || currentInput === 'Error') return;

            switch (action) {
                case 'MC':
                    memoryValue = 0;
                    break;
                case 'MR':
                    currentInput = memoryValue.toString();
                    shouldResetDisplay = true;
                    updateDisplay();
                    break;
                case 'M+':
                    memoryValue += val;
                    shouldResetDisplay = true;
                    break;
                case 'M-':
                    memoryValue -= val;
                    shouldResetDisplay = true;
                    break;
                case 'MS':
                    memoryValue = val;
                    shouldResetDisplay = true;
                    break;
            }
        }

        // Physical Keyboard Support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                appendDigit(e.key);
            } else if (e.key === '.') {
                appendDecimal();
            } else if (e.key === '+') {
                handleOperator('+');
            } else if (e.key === '-') {
                handleOperator('-');
            } else if (e.key === '*') {
                handleOperator('*');
            } else if (e.key === '/') {
                e.preventDefault();
                handleOperator('/');
            } else if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault();
                calculateResult();
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Escape') {
                clearAll();
            } else if (e.key === '%') {
                handleFunction('%');
            }
        });