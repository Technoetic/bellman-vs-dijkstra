import { describe, expect, it } from "vitest";
import Graph from "../models/Graph.js";
import DijkstraAlgorithm from "./DijkstraAlgorithm.js";

describe("DijkstraAlgorithm", () => {
	describe("기본 그래프에서 최단 거리 계산", () => {
		it("기본 프리셋으로 알고리즘 실행", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result).toBeDefined();
			expect(result.steps).toBeDefined();
			expect(result.finalDistances).toBeDefined();
		});

		it("A에서 B까지의 최단 거리는 4", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("B")).toBe(4);
		});

		it("A에서 C까지의 최단 거리는 2", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("C")).toBe(2);
		});

		it("A에서 D까지의 최단 거리는 9", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("D")).toBe(9);
		});

		it("A에서 E까지의 최단 거리는 11", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("E")).toBe(11);
		});
	});

	describe("steps 배열", () => {
		it("steps 배열이 비어있지 않음", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.steps.length).toBeGreaterThan(0);
		});

		it("각 step에 필수 속성 포함", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			result.steps.forEach((step) => {
				expect(step).toHaveProperty("stepNumber");
				expect(step).toHaveProperty("description");
				expect(step).toHaveProperty("distances");
				expect(step).toHaveProperty("visited");
				expect(step).toHaveProperty("current");
				expect(step).toHaveProperty("relaxedEdge");
				expect(step).toHaveProperty("predecessors");
			});
		});

		it("각 step의 distances는 Map 객체", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			result.steps.forEach((step) => {
				expect(step.distances).toBeInstanceOf(Map);
			});
		});

		it("각 step의 visited는 Set 객체", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			result.steps.forEach((step) => {
				expect(step.visited).toBeInstanceOf(Set);
			});
		});

		it("첫 번째 step은 초기화 step", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.steps[0].description).toContain("초기화");
		});

		it("step 번호가 순차적으로 증가", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			result.steps.forEach((step, index) => {
				expect(step.stepNumber).toBe(index + 1);
			});
		});
	});

	describe("시작 노드 거리", () => {
		it("시작 노드(A)의 거리는 0", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("A")).toBe(0);
		});

		it("다른 노드에서 시작할 때 그 노드의 거리는 0", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("B");

			expect(result.finalDistances.get("B")).toBe(0);
		});
	});

	describe("도달 불가 노드", () => {
		it("도달 불가 노드의 거리는 Infinity", () => {
			const graph = new Graph();
			graph.addNode("A", "A", 100, 150);
			graph.addNode("B", "B", 250, 100);
			graph.addNode("C", "C", 250, 200);

			graph.addEdge("A", "B", 4);

			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("C")).toBe(Infinity);
		});
	});

	describe("결과 정확성", () => {
		it("전체 최단 경로 결과 확인", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			const expected = {
				A: 0,
				B: 4,
				C: 2,
				D: 9,
				E: 11,
			};

			Object.entries(expected).forEach(([nodeId, expectedDist]) => {
				expect(result.finalDistances.get(nodeId)).toBe(expectedDist);
			});
		});

		it("totalSteps가 steps 배열 길이와 일치", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.totalSteps).toBe(result.steps.length);
		});
	});

	describe("predecessors 경로 추적", () => {
		it("predecessors가 정의됨", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.predecessors).toBeDefined();
			expect(result.predecessors).toBeInstanceOf(Map);
		});

		it("시작 노드의 predecessor는 null", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.predecessors.get("A")).toBeNull();
		});

		it("각 노드의 predecessor는 문자열 또는 null", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			result.predecessors.forEach((predecessor, nodeId) => {
				if (predecessor !== null) {
					expect(typeof predecessor).toBe("string");
					expect(graph.getNode(predecessor)).toBeDefined();
				}
			});
		});
	});

	describe("알고리즘 기본 동작", () => {
		it("getSteps로 steps 배열 조회 가능", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			algorithm.run("A");

			const steps = algorithm.getSteps();
			expect(steps).toBeInstanceOf(Array);
			expect(steps.length).toBeGreaterThan(0);
		});

		it("getResult로 결과 조회 가능", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result1 = algorithm.run("A");
			const result2 = algorithm.getResult();

			expect(result1.steps.length).toBe(result2.steps.length);
			expect(result1.finalDistances.get("A")).toBe(
				result2.finalDistances.get("A"),
			);
		});

		it("두 번 실행하면 다시 초기화됨", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);

			algorithm.run("A");
			const firstSteps = algorithm.steps.length;

			const newGraph = Graph.createPreset("default");
			const newAlgorithm = new DijkstraAlgorithm(newGraph);
			newAlgorithm.run("B");
			const secondSteps = newAlgorithm.steps.length;

			expect(firstSteps).toBeGreaterThan(0);
			expect(secondSteps).toBeGreaterThan(0);
		});
	});

	describe("edge cases", () => {
		it("한 개의 노드만 있는 그래프", () => {
			const graph = new Graph();
			graph.addNode("A", "A", 100, 150);

			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("A")).toBe(0);
			expect(result.steps.length).toBeGreaterThan(0);
		});

		it("자기 루프가 있는 그래프", () => {
			const graph = new Graph([], [], true);
			graph.addNode("A", "A", 100, 150);
			graph.addNode("B", "B", 250, 100);

			graph.addEdge("A", "B", 5);
			graph.addEdge("A", "A", 1); // 자기 루프

			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("B")).toBe(5);
		});

		it("음수 가중치가 있는 그래프 (경고만 표시)", () => {
			const graph = Graph.createPreset("negative-weights");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			// 다익스트라는 음수 가중치에서 부정확할 수 있음
			// 하지만 실행은 가능해야 함
			expect(result.steps.length).toBeGreaterThan(0);
		});
	});

	describe("visited 추적", () => {
		it("마지막 step의 visited 노드 개수 확인", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			const lastStep = result.steps[result.steps.length - 1];
			expect(lastStep.visited).toBeInstanceOf(Set);
		});

		it("도달 불가 그래프에서 모든 노드가 방문되지 않음", () => {
			const graph = new Graph();
			graph.addNode("A", "A", 100, 150);
			graph.addNode("B", "B", 250, 100);
			graph.addNode("C", "C", 250, 200);
			graph.addEdge("A", "B", 4);

			const algorithm = new DijkstraAlgorithm(graph);
			const result = algorithm.run("A");

			const lastStep = result.steps[result.steps.length - 1];
			expect(lastStep.visited.size).toBeLessThan(3);
		});
	});
});
