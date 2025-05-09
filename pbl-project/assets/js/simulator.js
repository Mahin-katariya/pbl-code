document.addEventListener('DOMContentLoaded', () => {
    const dfa = new DFA();
    const canvas = document.getElementById('dfaCanvas');
    const canvasManager = new CanvasManager(canvas);

    // UI Elements
    const addStateBtn = document.getElementById('addState');
    const addTransitionBtn = document.getElementById('addTransition');
    const simulateBtn = document.getElementById('simulate');
    const stepBtn = document.getElementById('step');
    const resetBtn = document.getElementById('reset');
    const inputString = document.getElementById('inputString');

    let stateCounter = 0;
    let currentSimulation = null;

    // Add State
    addStateBtn.addEventListener('click', () => {
        const stateName = `q${stateCounter++}`;
        dfa.addState(stateName);
        canvasManager.addState(stateName);
        updateStateSelects();
    });

    // Add Transition
    addTransitionBtn.addEventListener('click', () => {
        const fromState = document.getElementById('fromState').value;
        const symbol = document.getElementById('symbol').value;
        const toState = document.getElementById('toState').value;

        if (fromState && symbol && toState) {
            if (dfa.addTransition(fromState, symbol, toState)) {
                canvasManager.addTransition(fromState, symbol, toState);
                
                // Add to transition list
                const transitionList = document.getElementById('transitionList');
                const transitionItem = document.createElement('div');
                transitionItem.className = 'list-item';
                transitionItem.textContent = `${fromState} --${symbol}--> ${toState}`;
                transitionList.appendChild(transitionItem);
                
                // Clear input fields
                document.getElementById('symbol').value = '';
            }
        }
    });

    // Simulate
    simulateBtn.addEventListener('click', () => {
        const input = inputString.value.trim();
        
        if (!dfa.initialState) {
            alert("Please set an initial state first!");
            return;
        }

        if (dfa.finalStates.size === 0) {
            alert("Please set at least one final state!");
            return;
        }

        console.log("Starting simulation with input:", input);
        console.log("Current DFA state:", {
            states: Array.from(dfa.states),
            initialState: dfa.initialState,
            finalStates: Array.from(dfa.finalStates),
            transitions: Array.from(dfa.transitions.entries())
        });

        const result = dfa.simulate(input);
        
        // Display result with more information
        const resultDiv = document.getElementById('result');
        const currentStateDiv = document.getElementById('currentState');
        const remainingInputDiv = document.getElementById('remainingInput');

        if (result.error) {
            resultDiv.textContent = `Result: Rejected (${result.error})`;
            resultDiv.style.color = '#dc2626'; // Red
        } else {
            resultDiv.textContent = `Result: ${result.accepted ? 'Accepted' : 'Rejected'}`;
            resultDiv.style.color = result.accepted ? '#16a34a' : '#dc2626';
        }

        currentStateDiv.textContent = `Path: ${result.path.join(' → ')}`;
        remainingInputDiv.textContent = `Final State: ${result.path[result.path.length - 1]}`;

        // Animate the path
        if (result.path.length > 0) {
            result.path.forEach((state, index) => {
                setTimeout(() => {
                    canvasManager.highlightState(state);
                }, index * 500);
            });
        }
    });

    // Step through simulation
    let currentStep = 0;
    let simulationPath = [];

    stepBtn.addEventListener('click', () => {
        if (!simulationPath.length) {
            const input = inputString.value;
            const result = dfa.simulate(input);
            simulationPath = result.path;
            currentStep = 0;
        }

        if (currentStep < simulationPath.length) {
            canvasManager.highlightState(simulationPath[currentStep]);
            currentStep++;
        }
    });

    // Reset simulation
    resetBtn.addEventListener('click', () => {
        currentStep = 0;
        simulationPath = [];
        displayResult({ accepted: false, path: [] });
    });

    // Helper functions
    function updateStateSelects() {
        const states = Array.from(dfa.states);
        updateSelect('fromState', states);
        updateSelect('toState', states);
        updateSelect('initialState', states);
        updateFinalStates(states);
    }

    function updateSelect(id, options) {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Select State</option>';
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
    }

    function updateFinalStates(states) {
        const container = document.getElementById('finalStatesList');
        container.innerHTML = '';
        states.forEach(state => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = state;
            checkbox.addEventListener('change', e => {
                if (e.target.checked) {
                    console.log("Adding final state:", state);
                    dfa.addFinalState(state);
                    canvasManager.setFinalState(state, true);
                } else {
                    console.log("Removing final state:", state);
                    dfa.finalStates.delete(state);
                    canvasManager.setFinalState(state, false);
                }
            });
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(` ${state}`));
            container.appendChild(label);
        });
    }

    // Add initial state handling
    document.getElementById('initialState').addEventListener('change', (e) => {
        const state = e.target.value;
        if (state) {
            console.log("Setting initial state:", state);
            dfa.setInitialState(state);
        }
    });

    // Update the displayResult function to show more information
    function displayResult(result) {
        const resultDiv = document.getElementById('result');
        const currentStateDiv = document.getElementById('currentState');
        const remainingInputDiv = document.getElementById('remainingInput');

        resultDiv.textContent = `Result: ${result.accepted ? 'Accepted' : 'Rejected'}`;
        resultDiv.style.color = result.accepted ? '#16a34a' : '#dc2626';
        
        if (result.path && result.path.length > 0) {
            currentStateDiv.textContent = `Final State: ${result.path[result.path.length - 1]}`;
            remainingInputDiv.textContent = `Path: ${result.path.join(' → ')}`;
        } else {
            currentStateDiv.textContent = 'Current State: -';
            remainingInputDiv.textContent = 'Path: -';
        }
    }

    function animateSimulation(path) {
        path.forEach((state, index) => {
            setTimeout(() => {
                canvasManager.highlightState(state);
            }, index * 500);
        });
    }
}); 