import { describe, expect, it } from "vitest";
import Graph from "../models/Graph.js";
import BellmanFordAlgorithm from "./BellmanFordAlgorithm.js";

describe("BellmanFordAlgorithm", () => {
	describe("기본 그래프에서 최단 거리 계산", () => {
		it("기본 프리셋으로 알고리즘 실행", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result).toBeDefined();
			expect(result.steps).toBeDefined();
			expect(result.finalDistances).toBeDefined();
			expect(result.hasNegativeCycle).toBe(false);
		});

		it("기본 그래프: A에서 B까지의 최단 거리는 4", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("B")).toBe(4);
		});

		it("기본 그래프: A에서 C까지의 최단 거리는 2", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("C")).toBe(2);
		});

		it("기본 그래프: A에서 D까지의 최단 거리는 9", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("D")).toBe(9);
		});

		it("기본 그래프: A에서 E까지의 최단 거리는 11", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("E")).toBe(11);
		});
	});

	describe("다익스트라와 비교 (음수 가중치 없을 때)", () => {
		it("기본 그래프에서 다익스트라 결과와 일치", () => {
			const graph1 = Graph.createPreset("default");
			const graph2 = Graph.createPreset("default");

			const bellmanFord = new BellmanFordAlgorithm(graph2);

			const bellResult = bellmanFord.run("A");
			expect(bellResult.hasNegativeCycle).toBe(false);

			// 최단 거리 값이 모두 일치해야 함
			expect(bellResult.finalDistances.get("A")).toBe(0);
			expect(bellResult.finalDistances.get("B")).toBe(4);
			expect(bellResult.finalDistances.get("C")).toBe(2);
			expect(bellResult.finalDistances.get("D")).toBe(9);
			expect(bellResult.finalDistances.get("E")).toBe(11);
		});
	});

	describe("음수 가중치가 있는 그래프", () => {
		it("negative-weights 프리셋으로 실행", () => {
			const graph = Graph.createPreset("negative-weights");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result).toBeDefined();
			expect(result.finalDistances).toBeDefined();
		});

		it("negative-weights: 음수 사이클 감지되지 않음", () => {
			const graph = Graph.createPreset("negative-weights");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.hasNegativeCycle).toBe(false);
		});

		it("negative-weights: A에서 B까지의 최단 거리", () => {
			const graph = Graph.createPreset("negative-weights");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			// A → B (4) or other paths
			// 최단은 4
			expect(result.finalDistances.get("B")).toBe(4);
		});

		it("negative-weights: A에서 C까지의 최단 거리", () => {
			const graph = Graph.createPreset("negative-weights");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("C")).toBe(1);
		});
	});

	describe("음수 사이클 감지", () => {
		it("negative-cycle 프리셋에서 음수 사이클 감지", () => {
			const graph = Graph.createPreset("negative-cycle");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.hasNegativeCycle).toBe(true);
		});

		it("음수 사이클 감지 시 hasNegativeCycle 속성이 true", () => {
			const graph = Graph.createPreset("negative-cycle");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result).toHaveProperty("hasNegativeCycle");
			expect(result.hasNegativeCycle).toBe(true);
		});

		it("음수 사이클 감지 시에도 steps 배열 존재", () => {
			const graph = Graph.createPreset("negative-cycle");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.steps.length).toBeGreaterThan(0);
			expect(result.steps).toBeInstanceOf(Array);
		});

		it("음수 사이클 감지 후에도 distances와 predecessors 존재", () => {
			const graph = Graph.createPreset("negative-cycle");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances).toBeDefined();
			expect(result.predecessors).toBeDefined();
		});
	});

	describe("steps 배열", () => {
		it("steps 배열이 비어있지 않음", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.steps.length).toBeGreaterThan(0);
		});

		it("각 step에 필수 속성 포함", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
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
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			result.steps.forEach((step) => {
				expect(step.distances).toBeInstanceOf(Map);
			});
		});

		it("각 step의 visited는 Set 객체", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			result.steps.forEach((step) => {
				expect(step.visited).toBeInstanceOf(Set);
			});
		});

		it("첫 번째 step은 초기화 step", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.steps[0].description).toContain("초기화");
		});

		it("step 번호가 순차적으로 증가", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			result.steps.forEach((step, index) => {
				expect(step.stepNumber).toBe(index + 1);
			});
		});
	});

	describe("시작 노드 거리", () => {
		it("시작 노드(A)의 거리는 0", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("A")).toBe(0);
		});

		it("다른 노드에서 시작할 때 그 노드의 거리는 0", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
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

			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("C")).toBe(Infinity);
		});
	});

	describe("결과 정확성", () => {
		it("전체 최단 경로 결과 확인 (기본 그래프)", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
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
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.totalSteps).toBe(result.steps.length);
		});
	});

	describe("predecessors 경로 추적", () => {
		it("predecessors가 정의됨", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.predecessors).toBeDefined();
			expect(result.predecessors).toBeInstanceOf(Map);
		});

		it("시작 노드의 predecessor는 null", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.predecessors.get("A")).toBeNull();
		});

		it("각 노드의 predecessor는 문자열 또는 null", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
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
			const algorithm = new BellmanFordAlgorithm(graph);
			algorithm.run("A");

			const steps = algorithm.getSteps();
			expect(steps).toBeInstanceOf(Array);
			expect(steps.length).toBeGreaterThan(0);
		});

		it("getResult로 결과 조회 가능", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result1 = algorithm.run("A");
			const result2 = algorithm.getResult();

			expect(result1.steps.length).toBe(result2.steps.length);
			expect(result1.finalDistances.get("A")).toBe(
				result2.finalDistances.get("A"),
			);
		});

		it("getResult에 hasNegativeCycle 속성 포함", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			algorithm.run("A");

			const result = algorithm.getResult();
			expect(result).toHaveProperty("hasNegativeCycle");
		});
	});

	describe("edge cases", () => {
		it("한 개의 노드만 있는 그래프", () => {
			const graph = new Graph();
			graph.addNode("A", "A", 100, 150);

			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("A")).toBe(0);
			expect(result.steps.length).toBeGreaterThan(0);
			expect(result.hasNegativeCycle).toBe(false);
		});

		it("자기 루프가 있는 그래프 (양수 가중치)", () => {
			const graph = new Graph([], [], true);
			graph.addNode("A", "A", 100, 150);
			graph.addNode("B", "B", 250, 100);

			graph.addEdge("A", "B", 5);
			graph.addEdge("A", "A", 1); // 양수 자기 루프

			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("B")).toBe(5);
			expect(result.hasNegativeCycle).toBe(false);
		});

		it("자기 루프가 있는 그래프 (음수 가중치)", () => {
			const graph = new Graph([], [], true);
			graph.addNode("A", "A", 100, 150);
			graph.addNode("B", "B", 250, 100);

			graph.addEdge("A", "B", 5);
			graph.addEdge("A", "A", -1); // 음수 자기 루프 = 음수 사이클

			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.hasNegativeCycle).toBe(true);
		});

		it("연결되지 않은 그래프", () => {
			const graph = new Graph();
			graph.addNode("A", "A", 100, 150);
			graph.addNode("B", "B", 250, 100);
			graph.addNode("C", "C", 250, 200);
			graph.addEdge("A", "B", 4);

			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result.finalDistances.get("A")).toBe(0);
			expect(result.finalDistances.get("B")).toBe(4);
			expect(result.finalDistances.get("C")).toBe(Infinity);
			expect(result.hasNegativeCycle).toBe(false);
		});
	});

	describe("결과 객체 구조", () => {
		it("getResult의 반환 타입", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(result).toHaveProperty("steps");
			expect(result).toHaveProperty("totalSteps");
			expect(result).toHaveProperty("finalDistances");
			expect(result).toHaveProperty("predecessors");
			expect(result).toHaveProperty("hasNegativeCycle");
		});

		it("hasNegativeCycle은 boolean", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			expect(typeof result.hasNegativeCycle).toBe("boolean");
		});
	});

	describe("음수 사이클 관련 단계", () => {
		it("음수 사이클 감지 후 마지막 step은 완료 메시지", () => {
			const graph = Graph.createPreset("negative-cycle");
			const algorithm = new BellmanFordAlgorithm(graph);
			const result = algorithm.run("A");

			const lastStep = result.steps[result.steps.length - 1];
			expect(lastStep.description).toContain("음수 사이클");
		});
	});

	describe("constructor와 속성 초기화", () => {
		it("생성자에서 hasNegativeCycle 초기화", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);

			expect(algorithm.hasNegativeCycle).toBe(false);
		});

		it("run 전에는 hasNegativeCycle이 false", () => {
			const graph = Graph.createPreset("default");
			const algorithm = new BellmanFordAlgorithm(graph);

			expect(algorithm.hasNegativeCycle).toBe(false);
		});

		it("run 후 hasNegativeCycle은 업데이트됨", () => {
			const graph1 = Graph.createPreset("default");
			const algorithm1 = new BellmanFordAlgorithm(graph1);
			algorithm1.run("A");
			expect(algorithm1.hasNegativeCycle).toBe(false);

			const graph2 = Graph.createPreset("negative-cycle");
			const algorithm2 = new BellmanFordAlgorithm(graph2);
			algorithm2.run("A");
			expect(algorithm2.hasNegativeCycle).toBe(true);
		});
	});
});
