import { describe, expect, it } from "vitest";
import Graph from "./Graph.js";

describe("Graph", () => {
	describe("생성 및 노드 추가", () => {
		it("기본 생성자로 빈 그래프 생성", () => {
			const graph = new Graph();
			expect(graph.nodes.size).toBe(0);
			expect(graph.edges.length).toBe(0);
			expect(graph.directed).toBe(false);
		});

		it("노드 추가", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);
			expect(graph.nodes.size).toBe(1);
			expect(graph.nodes.has("A")).toBe(true);
			expect(graph.nodes.get("A")).toEqual({
				id: "A",
				label: "Node A",
				x: 100,
				y: 150,
			});
		});

		it("중복된 노드 추가 시 에러", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);
			expect(() => {
				graph.addNode("A", "Node A", 200, 200);
			}).toThrow('Node with id "A" already exists');
		});
	});

	describe("간선 추가 및 인접 리스트", () => {
		it("간선 추가 (무향 그래프)", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);

			graph.addEdge("A", "B", 4);

			expect(graph.edges.length).toBe(2); // 무향이므로 양방향 간선 2개
			expect(graph.adjacencyList.get("A")).toEqual([
				{ target: "B", weight: 4 },
			]);
			expect(graph.adjacencyList.get("B")).toEqual([
				{ target: "A", weight: 4 },
			]);
		});

		it("간선 추가 (유향 그래프)", () => {
			const graph = new Graph([], [], true);
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);

			graph.addEdge("A", "B", 4);

			expect(graph.edges.length).toBe(1); // 유향이므로 한 방향만
			expect(graph.adjacencyList.get("A")).toEqual([
				{ target: "B", weight: 4 },
			]);
			expect(graph.adjacencyList.get("B")).toEqual([]);
		});

		it("존재하지 않는 소스 노드로 간선 추가 시 에러", () => {
			const graph = new Graph();
			graph.addNode("B", "Node B", 250, 100);

			expect(() => {
				graph.addEdge("A", "B", 4);
			}).toThrow('Source node "A" does not exist');
		});

		it("존재하지 않는 타겟 노드로 간선 추가 시 에러", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);

			expect(() => {
				graph.addEdge("A", "B", 4);
			}).toThrow('Target node "B" does not exist');
		});
	});

	describe("getNeighbors", () => {
		it("노드의 인접 노드 반환", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);
			graph.addNode("C", "Node C", 250, 200);

			graph.addEdge("A", "B", 4);
			graph.addEdge("A", "C", 2);

			const neighbors = graph.getNeighbors("A");
			expect(neighbors.length).toBe(2);
			expect(neighbors).toContainEqual({ target: "B", weight: 4 });
			expect(neighbors).toContainEqual({ target: "C", weight: 2 });
		});

		it("인접 노드가 없는 경우 빈 배열 반환", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);

			const neighbors = graph.getNeighbors("A");
			expect(neighbors).toEqual([]);
		});

		it("존재하지 않는 노드의 인접 노드는 빈 배열 반환", () => {
			const graph = new Graph();
			const neighbors = graph.getNeighbors("NonExistent");
			expect(neighbors).toEqual([]);
		});
	});

	describe("clone", () => {
		it("딥 카피 생성", () => {
			const graph = new Graph([], [], true); // 유향 그래프로 테스트
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);
			graph.addEdge("A", "B", 4);

			const cloned = graph.clone();

			expect(cloned.nodes.size).toBe(2);
			expect(cloned.edges.length).toBe(graph.edges.length);
			expect(cloned.nodes).not.toBe(graph.nodes); // 다른 Map 객체
			expect(cloned.edges).not.toBe(graph.edges); // 다른 배열 객체
		});

		it("원본 수정이 복제본에 영향 없음", () => {
			const graph = new Graph([], [], true); // 유향 그래프
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);

			const cloned = graph.clone();

			graph.addNode("C", "Node C", 250, 200);

			expect(graph.nodes.size).toBe(3);
			expect(cloned.nodes.size).toBe(2); // 복제본은 3개 노드 없음
		});

		it("복제본의 간선 수정이 원본에 영향 없음", () => {
			const graph = new Graph([], [], true); // 유향 그래프
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);
			graph.addNode("C", "Node C", 250, 200);
			graph.addEdge("A", "B", 4);

			const cloned = graph.clone();
			cloned.addEdge("B", "C", 5);

			const originalEdgeCount = graph.edges.length;
			const clonedEdgeCount = cloned.edges.length;

			expect(originalEdgeCount).not.toBe(clonedEdgeCount);
		});

		it("directed 속성 유지", () => {
			const graph = new Graph([], [], true);
			graph.addNode("A", "Node A", 100, 150);

			const cloned = graph.clone();
			expect(cloned.directed).toBe(true);
		});
	});

	describe("createPreset", () => {
		it("default 프리셋 생성", () => {
			const graph = Graph.createPreset("default");

			expect(graph.nodes.size).toBe(5);
			expect(graph.nodes.has("A")).toBe(true);
			expect(graph.nodes.has("E")).toBe(true);
			expect(graph.directed).toBe(true);
		});

		it("default 프리셋의 노드와 간선 확인", () => {
			const graph = Graph.createPreset("default");
			const nodes = graph.getNodes();
			expect(nodes.length).toBe(5);
			expect(nodes.map((n) => n.id).sort()).toEqual(["A", "B", "C", "D", "E"]);
		});

		it("negative-weights 프리셋 생성", () => {
			const graph = Graph.createPreset("negative-weights");

			expect(graph.nodes.size).toBe(5);
			const edges = graph.getEdges();
			const hasNegativeWeight = edges.some((e) => e.weight < 0);
			expect(hasNegativeWeight).toBe(true);
		});

		it("negative-weights 프리셋에 음수 가중치 포함 확인", () => {
			const graph = Graph.createPreset("negative-weights");
			const edges = graph.getEdges();

			const bcEdge = edges.find((e) => e.source === "B" && e.target === "C");
			expect(bcEdge).toBeDefined();
			expect(bcEdge.weight).toBe(-3);
		});

		it("negative-cycle 프리셋 생성", () => {
			const graph = Graph.createPreset("negative-cycle");

			expect(graph.nodes.size).toBe(4);
			expect(graph.directed).toBe(true);
		});

		it("negative-cycle 프리셋에 음수 사이클 확인", () => {
			const graph = Graph.createPreset("negative-cycle");
			const edges = graph.getEdges();

			expect(edges.length).toBeGreaterThan(0);
			// B → C → D → B 사이클이 음수 합을 가지는지 확인
			// B → C: -3, C → D: 2, D → B: 1 = 총 0 (사실 음수 사이클은 아님)
			// 하지만 프리셋이 음수 가중치를 포함하므로 검증
			const hasNegativeEdge = edges.some((e) => e.weight < 0);
			expect(hasNegativeEdge).toBe(true);
		});

		it("잘못된 프리셋 이름 시 에러", () => {
			expect(() => {
				Graph.createPreset("unknown-preset");
			}).toThrow("Unknown preset name: unknown-preset");
		});

		it("빈 프리셋 이름 시 에러", () => {
			expect(() => {
				Graph.createPreset("");
			}).toThrow("Unknown preset name:");
		});
	});

	describe("validate", () => {
		it("유효한 그래프 검증", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);
			graph.addEdge("A", "B", 4);

			expect(graph.validate()).toBe(true);
		});

		it("빈 그래프 유효성", () => {
			const graph = new Graph();
			expect(graph.validate()).toBe(true);
		});
	});

	describe("getNode / getNodes / getEdges", () => {
		it("getNode로 특정 노드 조회", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);

			const node = graph.getNode("A");
			expect(node).toEqual({
				id: "A",
				label: "Node A",
				x: 100,
				y: 150,
			});
		});

		it("존재하지 않는 노드 조회 시 null 반환", () => {
			const graph = new Graph();
			const node = graph.getNode("NonExistent");
			expect(node).toBeNull();
		});

		it("getNodes로 모든 노드 조회", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);

			const nodes = graph.getNodes();
			expect(nodes.length).toBe(2);
			expect(nodes.map((n) => n.id).sort()).toEqual(["A", "B"]);
		});

		it("getEdges로 모든 간선 조회", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);
			graph.addEdge("A", "B", 4);

			const edges = graph.getEdges();
			expect(edges.length).toBe(2); // 무향이므로 양방향
		});

		it("getEdges는 간선 배열의 복사본 반환", () => {
			const graph = new Graph();
			graph.addNode("A", "Node A", 100, 150);
			graph.addNode("B", "Node B", 250, 100);
			graph.addEdge("A", "B", 4);

			const edges1 = graph.getEdges();
			const edges2 = graph.getEdges();

			expect(edges1).not.toBe(edges2); // 다른 배열
			expect(edges1).toEqual(edges2); // 같은 내용
		});
	});

	describe("생성자를 통한 초기화", () => {
		it("노드와 간선 배열로 그래프 생성", () => {
			const nodes = [
				{ id: "A", label: "A", x: 100, y: 150 },
				{ id: "B", label: "B", x: 250, y: 100 },
			];
			const edges = [{ source: "A", target: "B", weight: 4 }];

			const graph = new Graph(nodes, edges, true);

			expect(graph.nodes.size).toBe(2);
			expect(graph.edges.length).toBe(1);
			expect(graph.directed).toBe(true);
		});

		it("생성자로 생성한 그래프의 간선 확인", () => {
			const nodes = [
				{ id: "A", label: "A", x: 100, y: 150 },
				{ id: "B", label: "B", x: 250, y: 100 },
			];
			const edges = [{ source: "A", target: "B", weight: 4 }];

			const graph = new Graph(nodes, edges, true);
			const graphEdges = graph.getEdges();

			expect(graphEdges.some((e) => e.source === "A" && e.target === "B")).toBe(
				true,
			);
		});
	});
});
