class EventBus {
	constructor() {
		this.listeners = new Map();
	}

	on(event, callback) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event).push(callback);
	}

	off(event, callback) {
		if (!this.listeners.has(event)) {
			return;
		}

		const callbacks = this.listeners.get(event);
		const index = callbacks.indexOf(callback);
		if (index !== -1) {
			callbacks.splice(index, 1);
		}

		if (callbacks.length === 0) {
			this.listeners.delete(event);
		}
	}

	emit(event, data) {
		if (!this.listeners.has(event)) {
			return;
		}

		const callbacks = this.listeners.get(event);
		callbacks.forEach((callback) => {
			try {
				callback(data);
			} catch (error) {
				console.error("Error in event listener for %s:", event, error);
			}
		});
	}

	clear(event) {
		if (event === undefined) {
			this.listeners.clear();
		} else if (this.listeners.has(event)) {
			this.listeners.delete(event);
		}
	}
}

export default EventBus;

export const eventBus = new EventBus();

export const EventTypes = {
	GRAPH_CHANGED: "GRAPH_CHANGED",
	STEP_CHANGED: "STEP_CHANGED",
	SPEED_CHANGED: "SPEED_CHANGED",
	ALGORITHM_STARTED: "ALGORITHM_STARTED",
	ALGORITHM_COMPLETED: "ALGORITHM_COMPLETED",
	NEGATIVE_CYCLE_DETECTED: "NEGATIVE_CYCLE_DETECTED",
	PLAYBACK_STATE_CHANGED: "PLAYBACK_STATE_CHANGED",
};
