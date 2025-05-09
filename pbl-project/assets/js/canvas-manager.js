class CanvasManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.states = new Map(); // state -> {x, y}
        this.transitions = new Map(); // `${fromState},${symbol}` -> {toState, controlPoint}
        this.finalStates = new Set(); // Add this to track final states
        this.selectedState = null;
        this.dragging = false;
        this.stateRadius = 30;

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        // Set canvas size to match container
        const resize = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width - 32; // Adjust for padding
            this.canvas.height = rect.height - 32;
            this.draw();
        };

        window.addEventListener('resize', resize);
        resize();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    addState(state, x, y) {
        this.states.set(state, { x: x || 100, y: y || 100 });
        this.draw();
    }

    addTransition(fromState, symbol, toState) {
        const key = `${fromState},${symbol}`;
        const fromPos = this.states.get(fromState);
        const toPos = this.states.get(toState);

        if (!fromPos || !toPos) return;

        // Calculate control point for curved arrow
        let controlPoint;
        if (fromState === toState) {
            // Self-loop
            controlPoint = {
                x: fromPos.x,
                y: fromPos.y - this.stateRadius * 2
            };
        } else {
            // Regular transition
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const normal = { x: -dy, y: dx };
            const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            const normalizedNormal = {
                x: normal.x / len,
                y: normal.y / len
            };
            
            controlPoint = {
                x: midX + normalizedNormal.x * 50,
                y: midY + normalizedNormal.y * 50
            };
        }

        this.transitions.set(key, { toState, controlPoint });
        this.draw();
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        this.selectedState = this.getStateAtPosition(pos);
        if (this.selectedState) {
            this.dragging = true;
        }
    }

    handleMouseMove(e) {
        if (this.dragging && this.selectedState) {
            const pos = this.getMousePos(e);
            const statePos = this.states.get(this.selectedState);
            statePos.x = pos.x;
            statePos.y = pos.y;
            this.draw();
        }
    }

    handleMouseUp() {
        this.dragging = false;
        this.selectedState = null;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    getStateAtPosition(pos) {
        for (const [state, statePos] of this.states) {
            const dx = pos.x - statePos.x;
            const dy = pos.y - statePos.y;
            if (dx * dx + dy * dy <= this.stateRadius * this.stateRadius) {
                return state;
            }
        }
        return null;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw transitions
        for (const [key, transition] of this.transitions) {
            const [fromState, symbol] = key.split(',');
            this.drawTransition(fromState, symbol, transition);
        }

        // Draw states
        for (const [state, pos] of this.states) {
            this.drawState(state, pos);
        }
    }

    drawState(state, pos) {
        // Draw outer circle for final states
        if (this.finalStates.has(state)) {
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.stateRadius + 5, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#2563eb';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Draw main circle
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.stateRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.strokeStyle = '#2563eb';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw state label
        this.ctx.fillStyle = '#1f2937';
        this.ctx.font = '16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(state, pos.x, pos.y);
    }

    drawTransition(fromState, symbol, transition) {
        const fromPos = this.states.get(fromState);
        const toPos = this.states.get(transition.toState);
        const controlPoint = transition.controlPoint;

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#4b5563';
        this.ctx.lineWidth = 2;

        if (fromState === transition.toState) {
            // Draw self-loop
            this.drawSelfLoop(fromPos, controlPoint, symbol);
        } else {
            // Draw curved arrow
            this.drawCurvedArrow(fromPos, toPos, controlPoint, symbol);
        }
    }

    drawCurvedArrow(fromPos, toPos, controlPoint, symbol) {
        // Calculate the angle and points for the arrow
        const angle = Math.atan2(toPos.y - controlPoint.y, toPos.x - controlPoint.x);
        const arrowLength = 15;
        const arrowWidth = 8;

        // Calculate where the arrow should end (at the state's border)
        const dx = toPos.x - controlPoint.x;
        const dy = toPos.y - controlPoint.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const endX = toPos.x - (dx / len) * this.stateRadius;
        const endY = toPos.y - (dy / len) * this.stateRadius;

        // Draw the curved line
        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x, fromPos.y);
        this.ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endX, endY);
        this.ctx.stroke();

        // Draw the arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle - Math.PI/6),
            endY - arrowLength * Math.sin(angle - Math.PI/6)
        );
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle + Math.PI/6),
            endY - arrowLength * Math.sin(angle + Math.PI/6)
        );
        this.ctx.closePath();
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fill();

        // Draw the symbol
        this.ctx.fillStyle = '#1f2937';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            symbol,
            controlPoint.x,
            controlPoint.y - 10
        );
    }

    drawSelfLoop(pos, controlPoint, symbol) {
        const startAngle = -Math.PI/2;
        const endAngle = -Math.PI * 3/2;

        // Draw the loop
        this.ctx.beginPath();
        this.ctx.arc(
            pos.x,
            pos.y - this.stateRadius,
            this.stateRadius,
            startAngle,
            endAngle,
            true
        );
        this.ctx.stroke();

        // Draw arrow head
        const arrowLength = 15;
        const arrowWidth = 8;
        const arrowAngle = Math.PI/6;

        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y - this.stateRadius * 2);
        this.ctx.lineTo(
            pos.x - arrowLength * Math.cos(-Math.PI/2 - arrowAngle),
            pos.y - this.stateRadius * 2 + arrowLength * Math.sin(-Math.PI/2 - arrowAngle)
        );
        this.ctx.lineTo(
            pos.x - arrowLength * Math.cos(-Math.PI/2 + arrowAngle),
            pos.y - this.stateRadius * 2 + arrowLength * Math.sin(-Math.PI/2 + arrowAngle)
        );
        this.ctx.closePath();
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fill();

        // Draw the symbol
        this.ctx.fillStyle = '#1f2937';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            symbol,
            pos.x,
            pos.y - this.stateRadius * 2.5
        );
    }

    highlightState(state) {
        const pos = this.states.get(state);
        if (!pos) return;

        // Animate highlight using GSAP
        const circle = document.createElement('div');
        circle.style.position = 'absolute';
        circle.style.width = '60px';
        circle.style.height = '60px';
        circle.style.borderRadius = '50%';
        circle.style.backgroundColor = 'rgba(37, 99, 235, 0.2)';
        circle.style.left = `${pos.x - 30}px`;
        circle.style.top = `${pos.y - 30}px`;

        this.canvas.parentElement.appendChild(circle);

        gsap.to(circle, {
            scale: 1.5,
            opacity: 0,
            duration: 0.5,
            onComplete: () => circle.remove()
        });
    }

    setFinalState(state, isFinal) {
        if (isFinal) {
            this.finalStates.add(state);
        } else {
            this.finalStates.delete(state);
        }
        this.draw();
    }
} 