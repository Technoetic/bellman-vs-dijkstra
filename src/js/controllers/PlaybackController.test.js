import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EventBus from "./EventBus.js";
import PlaybackController from "./PlaybackController.js";

describe("PlaybackController", () => {
	let playbackController;
	let eventBus;

	beforeEach(() => {
		eventBus = new EventBus();
		playbackController = new PlaybackController(eventBus);
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe("setSteps", () => {
		it("should set dijkstra and bellmanford steps", () => {
			const dijkstraResult = {
				steps: [{ node: "A" }, { node: "B" }, { node: "C" }],
			};
			const bellmanfordResult = {
				steps: [{ node: "A" }, { node: "B" }, { node: "C" }],
			};

			playbackController.setSteps(dijkstraResult, bellmanfordResult);

			expect(playbackController.dijkstraSteps).toEqual(dijkstraResult.steps);
			expect(playbackController.bellmanfordSteps).toEqual(
				bellmanfordResult.steps,
			);
		});

		it("should reset currentStepIndex to -1", () => {
			playbackController.setSteps(
				{ steps: [{ node: "A" }] },
				{ steps: [{ node: "A" }] },
			);

			expect(playbackController.currentStepIndex).toBe(-1);
		});

		it("should set isPlaying to false", () => {
			playbackController.isPlaying = true;

			playbackController.setSteps(
				{ steps: [{ node: "A" }] },
				{ steps: [{ node: "A" }] },
			);

			expect(playbackController.isPlaying).toBe(false);
		});

		it("should handle empty steps arrays", () => {
			playbackController.setSteps({ steps: [] }, { steps: [] });

			expect(playbackController.dijkstraSteps).toEqual([]);
			expect(playbackController.bellmanfordSteps).toEqual([]);
			expect(playbackController.getTotalSteps()).toBe(0);
		});

		it("should handle missing steps property", () => {
			playbackController.setSteps({}, {});

			expect(playbackController.dijkstraSteps).toEqual([]);
			expect(playbackController.bellmanfordSteps).toEqual([]);
		});

		it("should clear running timer", () => {
			playbackController.timerId = 123;

			const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

			playbackController.setSteps(
				{ steps: [{ node: "A" }] },
				{ steps: [{ node: "A" }] },
			);

			expect(clearTimeoutSpy).toHaveBeenCalledWith(123);
			expect(playbackController.timerId).toBeNull();
		});

		it("should not throw when clearing non-existent timer", () => {
			playbackController.timerId = null;

			expect(() => {
				playbackController.setSteps(
					{ steps: [{ node: "A" }] },
					{ steps: [{ node: "A" }] },
				);
			}).not.toThrow();
		});
	});

	describe("stepForward", () => {
		beforeEach(() => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
			);
		});

		it("should increment currentStepIndex", () => {
			expect(playbackController.currentStepIndex).toBe(-1);

			playbackController.stepForward();

			expect(playbackController.currentStepIndex).toBe(0);

			playbackController.stepForward();

			expect(playbackController.currentStepIndex).toBe(1);
		});

		it("should not exceed total steps", () => {
			playbackController.currentStepIndex = 2;

			playbackController.stepForward();

			expect(playbackController.currentStepIndex).toBe(2);
		});

		it("should emit STEP_CHANGED event", () => {
			const emitSpy = vi.spyOn(eventBus, "emit");

			playbackController.stepForward();

			expect(emitSpy).toHaveBeenCalledWith(
				"STEP_CHANGED",
				expect.objectContaining({
					index: 0,
					totalSteps: 3,
				}),
			);
		});

		it("should auto-pause at the end", () => {
			const pauseSpy = vi.spyOn(playbackController, "pause");

			playbackController.currentStepIndex = 2;
			playbackController.stepForward();

			expect(pauseSpy).toHaveBeenCalled();
		});

		it("should include dijkstra and bellmanford steps in event", () => {
			const emitSpy = vi.spyOn(eventBus, "emit");

			playbackController.stepForward();

			expect(emitSpy).toHaveBeenCalledWith(
				"STEP_CHANGED",
				expect.objectContaining({
					dijkstraStep: { id: 1 },
					bellmanfordStep: { id: 1 },
				}),
			);
		});
	});

	describe("stepBackward", () => {
		beforeEach(() => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
			);
			playbackController.currentStepIndex = 2;
		});

		it("should decrement currentStepIndex", () => {
			playbackController.stepBackward();

			expect(playbackController.currentStepIndex).toBe(1);

			playbackController.stepBackward();

			expect(playbackController.currentStepIndex).toBe(0);
		});

		it("should not go below -1", () => {
			playbackController.currentStepIndex = -1;

			playbackController.stepBackward();

			expect(playbackController.currentStepIndex).toBe(-1);
		});

		it("should emit STEP_CHANGED event", () => {
			const emitSpy = vi.spyOn(eventBus, "emit");

			playbackController.stepBackward();

			expect(emitSpy).toHaveBeenCalledWith("STEP_CHANGED", expect.any(Object));
		});

		it("should pause playback when stepping backward", () => {
			playbackController.isPlaying = true;
			const pauseSpy = vi.spyOn(playbackController, "pause");

			playbackController.stepBackward();

			expect(pauseSpy).toHaveBeenCalled();
		});

		it("should not pause if already paused", () => {
			playbackController.isPlaying = false;
			const pauseSpy = vi.spyOn(playbackController, "pause");

			playbackController.stepBackward();

			expect(pauseSpy).not.toHaveBeenCalled();
		});
	});

	describe("jumpToStart", () => {
		beforeEach(() => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
			);
			playbackController.currentStepIndex = 2;
		});

		it("should set currentStepIndex to -1", () => {
			playbackController.jumpToStart();

			expect(playbackController.currentStepIndex).toBe(-1);
		});

		it("should pause playback", () => {
			playbackController.isPlaying = true;

			playbackController.jumpToStart();

			expect(playbackController.isPlaying).toBe(false);
		});

		it("should emit STEP_CHANGED event", () => {
			const emitSpy = vi.spyOn(eventBus, "emit");

			playbackController.jumpToStart();

			expect(emitSpy).toHaveBeenCalledWith(
				"STEP_CHANGED",
				expect.objectContaining({
					index: -1,
				}),
			);
		});
	});

	describe("jumpToEnd", () => {
		beforeEach(() => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
			);
			playbackController.currentStepIndex = 0;
		});

		it("should set currentStepIndex to last index", () => {
			playbackController.jumpToEnd();

			expect(playbackController.currentStepIndex).toBe(2);
		});

		it("should pause playback", () => {
			playbackController.isPlaying = true;

			playbackController.jumpToEnd();

			expect(playbackController.isPlaying).toBe(false);
		});

		it("should emit STEP_CHANGED event", () => {
			const emitSpy = vi.spyOn(eventBus, "emit");

			playbackController.jumpToEnd();

			expect(emitSpy).toHaveBeenCalledWith(
				"STEP_CHANGED",
				expect.objectContaining({
					index: 2,
					totalSteps: 3,
				}),
			);
		});

		it("should handle empty steps", () => {
			playbackController.setSteps({ steps: [] }, { steps: [] });

			playbackController.jumpToEnd();

			expect(playbackController.currentStepIndex).toBe(-1);
		});
	});

	describe("setSpeed", () => {
		it("should convert multiplier to milliseconds", () => {
			playbackController.setSpeed(1.0);
			expect(playbackController.speed).toBe(1000);

			playbackController.setSpeed(2.0);
			expect(playbackController.speed).toBe(500);

			playbackController.setSpeed(0.5);
			expect(playbackController.speed).toBe(2000);
		});

		it("should clamp speed between 0.25 and 4.0", () => {
			playbackController.setSpeed(0.1);
			expect(playbackController.speed).toBe(4000); // 1000 / 0.25

			playbackController.setSpeed(10.0);
			expect(playbackController.speed).toBe(250); // 1000 / 4.0
		});

		it("should round milliseconds to integer", () => {
			playbackController.setSpeed(1.3);
			expect(playbackController.speed).toBe(Math.round(1000 / 1.3));
		});

		it("should handle 0.25x speed", () => {
			playbackController.setSpeed(0.25);
			expect(playbackController.speed).toBe(4000);
		});

		it("should handle 4.0x speed", () => {
			playbackController.setSpeed(4.0);
			expect(playbackController.speed).toBe(250);
		});
	});

	describe("getCurrentStep", () => {
		beforeEach(() => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: "a" }, { id: "b" }, { id: "c" }] },
			);
		});

		it("should return current step object", () => {
			playbackController.currentStepIndex = 1;

			const step = playbackController.getCurrentStep();

			expect(step).toEqual({
				index: 1,
				dijkstraStep: { id: 2 },
				bellmanfordStep: { id: "b" },
			});
		});

		it("should return undefined steps when index is -1", () => {
			playbackController.currentStepIndex = -1;

			const step = playbackController.getCurrentStep();

			expect(step.index).toBe(-1);
			expect(step.dijkstraStep).toBeUndefined();
			expect(step.bellmanfordStep).toBeUndefined();
		});

		it("should return undefined steps when index exceeds array length", () => {
			playbackController.currentStepIndex = 10;

			const step = playbackController.getCurrentStep();

			expect(step.index).toBe(10);
			expect(step.dijkstraStep).toBeUndefined();
			expect(step.bellmanfordStep).toBeUndefined();
		});

		it("should handle steps with different lengths", () => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }] },
				{ steps: [{ id: "a" }] },
			);

			playbackController.currentStepIndex = 1;

			const step = playbackController.getCurrentStep();

			expect(step.dijkstraStep).toEqual({ id: 2 });
			expect(step.bellmanfordStep).toBeUndefined();
		});
	});

	describe("getTotalSteps", () => {
		it("should return total steps when both arrays same length", () => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: "a" }, { id: "b" }, { id: "c" }] },
			);

			expect(playbackController.getTotalSteps()).toBe(3);
		});

		it("should return max length when arrays differ", () => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
				{ steps: [{ id: "a" }, { id: "b" }] },
			);

			expect(playbackController.getTotalSteps()).toBe(4);
		});

		it("should return 0 for empty steps", () => {
			playbackController.setSteps({ steps: [] }, { steps: [] });

			expect(playbackController.getTotalSteps()).toBe(0);
		});

		it("should handle missing steps property", () => {
			playbackController.setSteps({}, {});

			expect(playbackController.getTotalSteps()).toBe(0);
		});
	});

	describe("play and pause", () => {
		beforeEach(() => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
			);
		});

		it("should set isPlaying to true", () => {
			playbackController.play();

			expect(playbackController.isPlaying).toBe(true);
		});

		it("should emit PLAYBACK_STATE_CHANGED on play", () => {
			const emitSpy = vi.spyOn(eventBus, "emit");

			playbackController.play();

			expect(emitSpy).toHaveBeenCalledWith("PLAYBACK_STATE_CHANGED", {
				isPlaying: true,
			});
		});

		it("should not call play twice", () => {
			playbackController.play();
			const emitSpy = vi.spyOn(eventBus, "emit");

			playbackController.play();

			expect(emitSpy).not.toHaveBeenCalled();
		});

		it("should set isPlaying to false on pause", () => {
			playbackController.isPlaying = true;

			playbackController.pause();

			expect(playbackController.isPlaying).toBe(false);
		});

		it("should emit PLAYBACK_STATE_CHANGED on pause", () => {
			playbackController.isPlaying = true;
			const emitSpy = vi.spyOn(eventBus, "emit");

			playbackController.pause();

			expect(emitSpy).toHaveBeenCalledWith("PLAYBACK_STATE_CHANGED", {
				isPlaying: false,
			});
		});

		it("should clear timer on pause", () => {
			playbackController.timerId = 123;
			const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

			playbackController.pause();

			expect(clearTimeoutSpy).toHaveBeenCalledWith(123);
			expect(playbackController.timerId).toBeNull();
		});

		it("should restart from beginning when at end", () => {
			playbackController.currentStepIndex = 2;

			playbackController.play();

			expect(playbackController.currentStepIndex).toBe(0);
		});
	});

	describe("reset", () => {
		beforeEach(() => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
			);
		});

		it("should reset to initial state", () => {
			playbackController.currentStepIndex = 2;
			playbackController.isPlaying = true;

			playbackController.reset();

			expect(playbackController.currentStepIndex).toBe(-1);
			expect(playbackController.isPlaying).toBe(false);
		});

		it("should clear timer", () => {
			playbackController.timerId = 123;
			const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

			playbackController.reset();

			expect(clearTimeoutSpy).toHaveBeenCalledWith(123);
			expect(playbackController.timerId).toBeNull();
		});

		it("should emit PLAYBACK_STATE_CHANGED", () => {
			const emitSpy = vi.spyOn(eventBus, "emit");

			playbackController.reset();

			expect(emitSpy).toHaveBeenCalledWith("PLAYBACK_STATE_CHANGED", {
				isPlaying: false,
			});
		});

		it("should emit STEP_CHANGED", () => {
			const emitSpy = vi.spyOn(eventBus, "emit");

			playbackController.reset();

			const stepChangeCall = emitSpy.mock.calls.find(
				(call) => call[0] === "STEP_CHANGED",
			);

			expect(stepChangeCall).toBeDefined();
		});
	});

	describe("playback integration", () => {
		beforeEach(() => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
			);
			playbackController.setSpeed(1.0); // 1000ms per step
		});

		it("should advance through steps when playing", () => {
			playbackController.play();

			expect(playbackController.currentStepIndex).toBe(0);

			vi.advanceTimersByTime(1000);
			expect(playbackController.currentStepIndex).toBe(1);

			vi.advanceTimersByTime(1000);
			expect(playbackController.currentStepIndex).toBe(2);

			vi.advanceTimersByTime(1000);
			expect(playbackController.currentStepIndex).toBe(2);
		});

		it("should pause playback when reaching the end", () => {
			playbackController.play();

			vi.advanceTimersByTime(3000);

			expect(playbackController.isPlaying).toBe(false);
		});

		it("should respect speed changes", () => {
			playbackController.setSpeed(2.0); // 500ms per step

			playbackController.play();

			expect(playbackController.currentStepIndex).toBe(0);

			vi.advanceTimersByTime(500);
			expect(playbackController.currentStepIndex).toBe(1);

			vi.advanceTimersByTime(500);
			expect(playbackController.currentStepIndex).toBe(2);
		});

		it("should handle pause during playback", () => {
			playbackController.play();

			vi.advanceTimersByTime(500);
			playbackController.pause();

			const indexBeforeWait = playbackController.currentStepIndex;

			vi.advanceTimersByTime(1000);

			expect(playbackController.currentStepIndex).toBe(indexBeforeWait);
		});

		it("should handle resume after pause", () => {
			playbackController.play();

			vi.advanceTimersByTime(500);
			playbackController.pause();

			playbackController.play();

			vi.advanceTimersByTime(1000);

			expect(playbackController.currentStepIndex).toBeGreaterThan(0);
		});
	});

	describe("edge cases", () => {
		it("should handle single step", () => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }] },
				{ steps: [{ id: 1 }] },
			);

			playbackController.stepForward();

			expect(playbackController.currentStepIndex).toBe(0);

			playbackController.stepForward();

			expect(playbackController.currentStepIndex).toBe(0);
		});

		it("should handle no steps", () => {
			playbackController.setSteps({ steps: [] }, { steps: [] });

			playbackController.stepForward();

			expect(playbackController.currentStepIndex).toBe(-1);
		});

		it("should handle rapid step forward calls", () => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
			);

			playbackController.stepForward();
			playbackController.stepForward();
			playbackController.stepForward();

			expect(playbackController.currentStepIndex).toBe(2);
		});

		it("should handle multiple setSteps calls", () => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }] },
				{ steps: [{ id: 1 }, { id: 2 }] },
			);

			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
			);

			expect(playbackController.getTotalSteps()).toBe(4);
			expect(playbackController.currentStepIndex).toBe(-1);
		});

		it("should handle stepBackward from start", () => {
			playbackController.setSteps(
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
				{ steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
			);

			playbackController.stepBackward();

			expect(playbackController.currentStepIndex).toBe(-1);
		});
	});
});
