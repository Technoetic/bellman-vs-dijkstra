class PlaybackController {
	constructor(eventBus) {
		this.eventBus = eventBus;
		this.dijkstraSteps = [];
		this.bellmanfordSteps = [];
		this.currentStepIndex = -1;
		this.isPlaying = false;
		this.speed = 1000; // milliseconds
		this.timerId = null;
	}

	setSteps(dijkstraResult, bellmanfordResult) {
		this.dijkstraSteps = dijkstraResult.steps || [];
		this.bellmanfordSteps = bellmanfordResult.steps || [];
		this.currentStepIndex = -1;
		this.isPlaying = false;

		// Clear any running timer
		if (this.timerId !== null) {
			clearTimeout(this.timerId);
			this.timerId = null;
		}
	}

	play() {
		if (this.isPlaying) {
			return;
		}

		this.isPlaying = true;
		this.eventBus.emit("PLAYBACK_STATE_CHANGED", { isPlaying: true });

		// If at end, restart from beginning
		if (this.currentStepIndex >= this.getTotalSteps() - 1) {
			this.currentStepIndex = -1;
		}

		this._tick();
	}

	pause() {
		this.isPlaying = false;

		if (this.timerId !== null) {
			clearTimeout(this.timerId);
			this.timerId = null;
		}

		this.eventBus.emit("PLAYBACK_STATE_CHANGED", { isPlaying: false });
	}

	stepForward() {
		if (this.currentStepIndex < this.getTotalSteps() - 1) {
			this.currentStepIndex++;
			this._emitStepChanged();
		}

		// Auto-pause at the end
		if (this.currentStepIndex >= this.getTotalSteps() - 1) {
			this.pause();
		}
	}

	stepBackward() {
		if (this.currentStepIndex > -1) {
			this.currentStepIndex--;
			this._emitStepChanged();
		}

		// If user steps back, pause
		if (this.isPlaying) {
			this.pause();
		}
	}

	jumpToStart() {
		this.currentStepIndex = -1;
		this.pause();
		this._emitStepChanged();
	}

	jumpToEnd() {
		this.currentStepIndex = this.getTotalSteps() - 1;
		this.pause();
		this._emitStepChanged();
	}

	reset() {
		this.currentStepIndex = -1;
		this.isPlaying = false;

		if (this.timerId !== null) {
			clearTimeout(this.timerId);
			this.timerId = null;
		}

		this.eventBus.emit("PLAYBACK_STATE_CHANGED", { isPlaying: false });
		this._emitStepChanged();
	}

	setSpeed(multiplier) {
		// Clamp speed multiplier to 0.25 ~ 4.0
		const clamped = Math.max(0.25, Math.min(4.0, multiplier));
		// Convert multiplier to milliseconds (inverted relationship)
		// 0.25× = 4000ms, 1.0× = 1000ms, 4.0× = 250ms
		this.speed = Math.round(1000 / clamped);
	}

	getCurrentStep() {
		const dijkstraStep = this.dijkstraSteps[this.currentStepIndex];
		const bellmanfordStep = this.bellmanfordSteps[this.currentStepIndex];

		return {
			index: this.currentStepIndex,
			dijkstraStep: dijkstraStep || undefined,
			bellmanfordStep: bellmanfordStep || undefined,
		};
	}

	getTotalSteps() {
		// Both result sets should have the same length
		// Use the longer one to handle edge cases
		return Math.max(this.dijkstraSteps.length, this.bellmanfordSteps.length);
	}

	_tick() {
		if (!this.isPlaying) {
			return;
		}

		// Advance to next step
		this.stepForward();

		// If not at end, schedule next tick
		if (this.currentStepIndex < this.getTotalSteps() - 1) {
			this.timerId = setTimeout(() => this._tick(), this.speed);
		}
	}

	_emitStepChanged() {
		const currentStep = this.getCurrentStep();
		this.eventBus.emit("STEP_CHANGED", {
			index: currentStep.index,
			dijkstraStep: currentStep.dijkstraStep,
			bellmanfordStep: currentStep.bellmanfordStep,
			totalSteps: this.getTotalSteps(),
		});
	}
}

export default PlaybackController;
