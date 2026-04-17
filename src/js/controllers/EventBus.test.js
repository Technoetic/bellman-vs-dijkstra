import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EventBus from "./EventBus.js";

describe("EventBus", () => {
	let eventBus;

	beforeEach(() => {
		eventBus = new EventBus();
	});

	afterEach(() => {
		eventBus = null;
	});

	describe("on/emit", () => {
		it("should call callback when event is emitted", () => {
			const callback = vi.fn();
			eventBus.on("test-event", callback);
			eventBus.emit("test-event");

			expect(callback).toHaveBeenCalledTimes(1);
		});

		it("should pass data to callback on emit", () => {
			const callback = vi.fn();
			const testData = { message: "hello", value: 42 };

			eventBus.on("test-event", callback);
			eventBus.emit("test-event", testData);

			expect(callback).toHaveBeenCalledWith(testData);
		});

		it("should handle multiple listeners on same event", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();
			const callback3 = vi.fn();

			eventBus.on("test-event", callback1);
			eventBus.on("test-event", callback2);
			eventBus.on("test-event", callback3);

			const testData = { test: true };
			eventBus.emit("test-event", testData);

			expect(callback1).toHaveBeenCalledWith(testData);
			expect(callback2).toHaveBeenCalledWith(testData);
			expect(callback3).toHaveBeenCalledWith(testData);
		});

		it("should register multiple callbacks for same listener", () => {
			const callback = vi.fn();

			eventBus.on("test-event", callback);
			eventBus.on("test-event", callback);

			eventBus.emit("test-event", {});

			expect(callback).toHaveBeenCalledTimes(2);
		});

		it("should not call unregistered event listeners", () => {
			const callback = vi.fn();

			eventBus.on("event-a", callback);
			eventBus.emit("event-b");

			expect(callback).not.toHaveBeenCalled();
		});

		it("should handle emit with no listeners silently", () => {
			expect(() => {
				eventBus.emit("nonexistent-event", { data: "test" });
			}).not.toThrow();
		});

		it("should handle emit with undefined data", () => {
			const callback = vi.fn();

			eventBus.on("test-event", callback);
			eventBus.emit("test-event");

			expect(callback).toHaveBeenCalledWith(undefined);
		});

		it("should handle emit with null data", () => {
			const callback = vi.fn();

			eventBus.on("test-event", callback);
			eventBus.emit("test-event", null);

			expect(callback).toHaveBeenCalledWith(null);
		});
	});

	describe("off", () => {
		it("should unregister specific callback", () => {
			const callback = vi.fn();

			eventBus.on("test-event", callback);
			eventBus.off("test-event", callback);
			eventBus.emit("test-event");

			expect(callback).not.toHaveBeenCalled();
		});

		it("should only remove specified callback when multiple exist", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			eventBus.on("test-event", callback1);
			eventBus.on("test-event", callback2);

			eventBus.off("test-event", callback1);
			eventBus.emit("test-event", {});

			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).toHaveBeenCalledTimes(1);
		});

		it("should remove only one instance of duplicate callbacks", () => {
			const callback = vi.fn();

			eventBus.on("test-event", callback);
			eventBus.on("test-event", callback);

			eventBus.off("test-event", callback);
			eventBus.emit("test-event", {});

			expect(callback).toHaveBeenCalledTimes(1);
		});

		it("should handle off for non-existent event", () => {
			const callback = vi.fn();

			expect(() => {
				eventBus.off("nonexistent-event", callback);
			}).not.toThrow();
		});

		it("should handle off for non-registered callback", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			eventBus.on("test-event", callback1);

			expect(() => {
				eventBus.off("test-event", callback2);
			}).not.toThrow();

			eventBus.emit("test-event", {});
			expect(callback1).toHaveBeenCalledTimes(1);
		});

		it("should delete event key when all callbacks are removed", () => {
			const callback = vi.fn();

			eventBus.on("test-event", callback);
			eventBus.off("test-event", callback);

			// Check internal state - listeners map should not have the event
			expect(eventBus.listeners.has("test-event")).toBe(false);
		});

		it("should not delete event key when other callbacks remain", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			eventBus.on("test-event", callback1);
			eventBus.on("test-event", callback2);

			eventBus.off("test-event", callback1);

			expect(eventBus.listeners.has("test-event")).toBe(true);
		});
	});

	describe("clear", () => {
		it("should clear all listeners when no event specified", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			eventBus.on("event-a", callback1);
			eventBus.on("event-b", callback2);

			eventBus.clear();

			eventBus.emit("event-a");
			eventBus.emit("event-b");

			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();
		});

		it("should clear specific event listeners", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			eventBus.on("event-a", callback1);
			eventBus.on("event-b", callback2);

			eventBus.clear("event-a");

			eventBus.emit("event-a");
			eventBus.emit("event-b");

			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).toHaveBeenCalledTimes(1);
		});

		it("should handle clear for non-existent event", () => {
			const callback = vi.fn();

			eventBus.on("event-a", callback);

			expect(() => {
				eventBus.clear("nonexistent-event");
			}).not.toThrow();

			eventBus.emit("event-a");
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it("should clear with undefined parameter clears all events", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();
			const callback3 = vi.fn();

			eventBus.on("event-a", callback1);
			eventBus.on("event-b", callback2);
			eventBus.on("event-c", callback3);

			eventBus.clear(undefined);

			eventBus.emit("event-a");
			eventBus.emit("event-b");
			eventBus.emit("event-c");

			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();
			expect(callback3).not.toHaveBeenCalled();
		});

		it("should empty the listeners map after clear()", () => {
			eventBus.on("event-a", () => {});
			eventBus.on("event-b", () => {});

			eventBus.clear();

			expect(eventBus.listeners.size).toBe(0);
		});
	});

	describe("error handling", () => {
		it("should catch and log errors in callbacks", () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			const callback = vi.fn(() => {
				throw new Error("Test error");
			});
			const callback2 = vi.fn();

			eventBus.on("test-event", callback);
			eventBus.on("test-event", callback2);

			eventBus.emit("test-event", {});

			expect(callback).toHaveBeenCalled();
			expect(callback2).toHaveBeenCalled();
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});

		it("should continue with other callbacks even if one throws", () => {
			const callback1 = vi.fn(() => {
				throw new Error("Callback 1 error");
			});
			const callback2 = vi.fn();
			const callback3 = vi.fn(() => {
				throw new Error("Callback 3 error");
			});

			eventBus.on("test-event", callback1);
			eventBus.on("test-event", callback2);
			eventBus.on("test-event", callback3);

			// Suppress console error
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			eventBus.emit("test-event", {});
			consoleErrorSpy.mockRestore();

			expect(callback1).toHaveBeenCalled();
			expect(callback2).toHaveBeenCalled();
			expect(callback3).toHaveBeenCalled();
		});
	});

	describe("event isolation", () => {
		it("should not mix listeners between different events", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			eventBus.on("event-a", callback1);
			eventBus.on("event-b", callback2);

			eventBus.emit("event-a");

			expect(callback1).toHaveBeenCalledTimes(1);
			expect(callback2).not.toHaveBeenCalled();
		});

		it("should support multiple independent events", () => {
			const callbackA = vi.fn();
			const callbackB = vi.fn();
			const callbackC = vi.fn();

			eventBus.on("event-a", callbackA);
			eventBus.on("event-b", callbackB);
			eventBus.on("event-c", callbackC);

			eventBus.emit("event-b", { type: "b" });

			expect(callbackA).not.toHaveBeenCalled();
			expect(callbackB).toHaveBeenCalledWith({ type: "b" });
			expect(callbackC).not.toHaveBeenCalled();
		});
	});

	describe("complex data types", () => {
		it("should handle complex objects", () => {
			const callback = vi.fn();
			const complexData = {
				nested: {
					values: [1, 2, 3],
					flag: true,
				},
				array: ["a", "b", "c"],
			};

			eventBus.on("test-event", callback);
			eventBus.emit("test-event", complexData);

			expect(callback).toHaveBeenCalledWith(complexData);
		});

		it("should handle arrays", () => {
			const callback = vi.fn();
			const arrayData = [1, 2, 3, 4, 5];

			eventBus.on("test-event", callback);
			eventBus.emit("test-event", arrayData);

			expect(callback).toHaveBeenCalledWith(arrayData);
		});

		it("should handle primitives", () => {
			const callback = vi.fn();

			eventBus.on("string-event", callback);
			eventBus.emit("string-event", "hello");

			expect(callback).toHaveBeenCalledWith("hello");

			callback.mockClear();

			eventBus.on("number-event", callback);
			eventBus.emit("number-event", 42);

			expect(callback).toHaveBeenCalledWith(42);

			callback.mockClear();

			eventBus.on("boolean-event", callback);
			eventBus.emit("boolean-event", true);

			expect(callback).toHaveBeenCalledWith(true);
		});
	});
});
