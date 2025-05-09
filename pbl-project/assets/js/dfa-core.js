class DFA {
    constructor() {
        this.states = new Set();
        this.alphabet = new Set();
        this.transitions = new Map();
        this.initialState = null;
        this.finalStates = new Set();
    }

    addState(state) {
        this.states.add(state);
    }

    setInitialState(state) {
        if (this.states.has(state)) {
            this.initialState = state;
            return true;
        }
        return false;
    }

    addFinalState(state) {
        if (this.states.has(state)) {
            this.finalStates.add(state);
            return true;
        }
        return false;
    }

    addTransition(fromState, symbol, toState) {
        if (!this.states.has(fromState) || !this.states.has(toState)) {
            return false;
        }

        this.alphabet.add(symbol);
        const key = `${fromState},${symbol}`;
        this.transitions.set(key, toState);
        return true;
    }

    simulate(input) {
        // Check if DFA is properly initialized
        if (!this.initialState || this.finalStates.size === 0) {
            console.log("DFA not properly initialized");
            return { accepted: false, path: [], error: "DFA not properly initialized" };
        }

        let currentState = this.initialState;
        const path = [currentState];

        console.log("Starting simulation from state:", currentState);
        console.log("Input string:", input);
        console.log("Final states:", Array.from(this.finalStates));

        for (let i = 0; i < input.length; i++) {
            const symbol = input[i];
            
            // Debug logging
            console.log(`Processing symbol: ${symbol} at state: ${currentState}`);

            if (!this.alphabet.has(symbol)) {
                console.log(`Invalid symbol: ${symbol}`);
                return { 
                    accepted: false, 
                    path, 
                    error: `Invalid symbol: ${symbol}` 
                };
            }

            const key = `${currentState},${symbol}`;
            const nextState = this.transitions.get(key);

            // Debug logging
            console.log(`Transition key: ${key}, Next state: ${nextState}`);

            if (!nextState) {
                console.log(`No transition found for: ${key}`);
                return { 
                    accepted: false, 
                    path, 
                    error: `No transition found from state ${currentState} with symbol ${symbol}` 
                };
            }

            currentState = nextState;
            path.push(currentState);
        }

        const accepted = this.finalStates.has(currentState);
        console.log(`Final state: ${currentState}, Accepted: ${accepted}`);

        return {
            accepted,
            path,
            error: accepted ? null : "String not accepted by DFA"
        };
    }

    step(currentState, symbol) {
        const key = `${currentState},${symbol}`;
        return this.transitions.get(key) || null;
    }

    toJSON() {
        return {
            states: Array.from(this.states),
            alphabet: Array.from(this.alphabet),
            transitions: Array.from(this.transitions),
            initialState: this.initialState,
            finalStates: Array.from(this.finalStates)
        };
    }

    fromJSON(json) {
        this.states = new Set(json.states);
        this.alphabet = new Set(json.alphabet);
        this.transitions = new Map(json.transitions);
        this.initialState = json.initialState;
        this.finalStates = new Set(json.finalStates);
    }
} 