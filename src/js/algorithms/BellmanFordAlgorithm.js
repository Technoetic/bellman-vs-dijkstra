import AlgorithmBase from "./AlgorithmBase.js";

export default class BellmanFordAlgorithm extends AlgorithmBase {
	constructor(graph) {
		super(graph);
		this.hasNegativeCycle = false;
	}

	/**
	 * 벨만-포드 알고리즘 실행
	 * @param {string} sourceId - 시작 노드 ID
	 * @returns {object} 알고리즘 결과 (hasNegativeCycle 속성 포함)
	 */
	run(sourceId) {
		const allNodes = this.graph.getNodes();
		const allEdges = this.graph.getEdges();

		// 1. 초기화
		for (const node of allNodes) {
			this.distances.set(node.id, Infinity);
			this.predecessors.set(node.id, null);
		}

		this.distances.set(sourceId, 0);
		this.captureSnapshot("초기화: 시작 노드 설정", sourceId, null);

		// 2. |V|-1번 반복 완화
		const numNodes = allNodes.length;
		for (let iteration = 1; iteration < numNodes; iteration++) {
			let anyRelaxation = false;

			for (const edge of allEdges) {
				const sourceDist = this.distances.get(edge.source);
				const targetDist = this.distances.get(edge.target);

				// 소스가 도달 불가능하면 스킵
				if (sourceDist === Infinity) {
					continue;
				}

				const newDist = sourceDist + edge.weight;

				// 완화 조건
				if (newDist < targetDist) {
					anyRelaxation = true;
					const oldDist = targetDist === Infinity ? "∞" : targetDist;

					this.distances.set(edge.target, newDist);
					this.predecessors.set(edge.target, edge.source);

					const sourceNode = this.graph.getNode(edge.source);
					const targetNode = this.graph.getNode(edge.target);

					this.captureSnapshot(
						`반복 ${iteration}: 간선 ${sourceNode.label}→${targetNode.label} 완화 (${oldDist} → ${newDist})`,
						edge.source,
						{ source: edge.source, target: edge.target, weight: edge.weight },
					);
				}
			}

			// 이번 반복에서 완화가 없으면 조기 종료 가능 (선택사항)
			if (!anyRelaxation) {
				break;
			}
		}

		// 3. 음수 사이클 감지: 한 번 더 반복
		this.hasNegativeCycle = false;
		for (const edge of allEdges) {
			const sourceDist = this.distances.get(edge.source);

			if (sourceDist === Infinity) {
				continue;
			}

			const newDist = sourceDist + edge.weight;
			const targetDist = this.distances.get(edge.target);

			if (newDist < targetDist) {
				this.hasNegativeCycle = true;
				const sourceNode = this.graph.getNode(edge.source);
				const targetNode = this.graph.getNode(edge.target);

				this.captureSnapshot(
					`음수 사이클 감지! 간선 ${sourceNode.label}→${targetNode.label}에서 추가 완화 가능`,
					edge.source,
					{ source: edge.source, target: edge.target, weight: edge.weight },
				);

				// 음수 사이클 발견 후 한 번 더 업데이트 (완화 가능성 시각화)
				this.distances.set(edge.target, newDist);
				this.predecessors.set(edge.target, edge.source);
			}
		}

		if (this.hasNegativeCycle) {
			this.captureSnapshot(
				"음수 사이클 감지: 최단 경로 계산 불가능",
				null,
				null,
			);
		} else {
			this.captureSnapshot("알고리즘 완료", null, null);
		}

		return this.getResult();
	}

	/**
	 * 결과 반환 (hasNegativeCycle 속성 포함)
	 * @returns {object} 알고리즘 결과
	 */
	getResult() {
		const baseResult = super.getResult();
		return {
			...baseResult,
			hasNegativeCycle: this.hasNegativeCycle,
		};
	}
}
