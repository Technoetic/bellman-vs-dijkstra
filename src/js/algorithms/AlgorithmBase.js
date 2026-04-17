export default class AlgorithmBase {
	constructor(graph) {
		this.graph = graph.clone();
		this.steps = [];
		this.distances = new Map();
		this.predecessors = new Map();
		this.visited = new Set();
	}

	/**
	 * 스냅샷 기록 (algorithm-visualizer의 tracer 패턴)
	 * @param {string} description - 한국어 설명
	 * @param {string|null} current - 현재 처리 노드 ID
	 * @param {object|null} relaxedEdge - 완화된 간선 {source, target, weight}
	 */
	captureSnapshot(description, current, relaxedEdge) {
		this.steps.push({
			stepNumber: this.steps.length + 1,
			description,
			distances: new Map(this.distances),
			visited: new Set(this.visited),
			current,
			relaxedEdge,
			predecessors: new Map(this.predecessors),
			snapshot: {
				distances: new Map(this.distances),
				visited: new Set(this.visited),
				predecessors: new Map(this.predecessors),
			},
		});
	}

	/**
	 * 알고리즘 실행 (서브클래스에서 구현)
	 * @param {string} sourceId - 시작 노드 ID
	 * @throws {Error} 서브클래스에서 구현 필요
	 */
	run(sourceId) {
		throw new Error("run() 메서드는 서브클래스에서 구현해야 합니다.");
	}

	/**
	 * 지금까지 기록된 스텝 반환
	 * @returns {object[]} 스텝 배열
	 */
	getSteps() {
		return this.steps;
	}

	/**
	 * 알고리즘 결과 반환
	 * @returns {object} 알고리즘 결과 (steps, totalSteps, finalDistances 등)
	 */
	getResult() {
		return {
			steps: this.steps,
			totalSteps: this.steps.length,
			finalDistances: new Map(this.distances),
			predecessors: new Map(this.predecessors),
		};
	}
}
