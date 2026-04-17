import AlgorithmBase from "./AlgorithmBase.js";

export default class DijkstraAlgorithm extends AlgorithmBase {
	/**
	 * 다익스트라 알고리즘 실행
	 * @param {string} sourceId - 시작 노드 ID
	 * @returns {object} 알고리즘 결과
	 */
	run(sourceId) {
		// 1. 초기화
		const allNodes = this.graph.getNodes();

		// 음수 가중치 감지
		const allEdges = this.graph.getEdges();
		for (const edge of allEdges) {
			if (edge.weight < 0) {
				console.warn(
					"다익스트라: 음수 가중치가 감지되었습니다. 결과가 정확하지 않을 수 있습니다.",
				);
			}
		}

		// 모든 노드의 거리를 무한대로 초기화
		for (const node of allNodes) {
			this.distances.set(node.id, Infinity);
			this.predecessors.set(node.id, null);
		}

		// 시작 노드 거리 = 0
		this.distances.set(sourceId, 0);
		this.captureSnapshot("초기화: 시작 노드 설정", sourceId, null);

		// 2. 메인 루프: 미방문 노드 중 최소 거리 노드 선택
		while (this.visited.size < allNodes.length) {
			// 미방문 노드 중 최소 거리 노드 찾기
			let minDistance = Infinity;
			let minNode = null;

			for (const node of allNodes) {
				const dist = this.distances.get(node.id);
				if (!this.visited.has(node.id) && dist < minDistance) {
					minDistance = dist;
					minNode = node;
				}
			}

			// 모든 노드가 방문되었거나 남은 노드가 모두 도달 불가능
			if (minNode === null) {
				break;
			}

			// 선택된 노드 기록
			this.visited.add(minNode.id);
			this.captureSnapshot(
				`노드 ${minNode.label} 선택 (거리: ${minDistance === Infinity ? "∞" : minDistance})`,
				minNode.id,
				null,
			);

			// 3. 인접 노드에 대해 완화(relaxation) 수행
			const neighbors = this.graph.getNeighbors(minNode.id);
			for (const neighbor of neighbors) {
				const targetId = neighbor.target;

				// 이미 방문한 노드는 스킵
				if (this.visited.has(targetId)) {
					continue;
				}

				const currentDist = this.distances.get(targetId);
				const newDist = this.distances.get(minNode.id) + neighbor.weight;

				// 더 짧은 거리 발견 → 완화
				if (newDist < currentDist) {
					const oldDist = currentDist === Infinity ? "∞" : currentDist;
					this.distances.set(targetId, newDist);
					this.predecessors.set(targetId, minNode.id);

					this.captureSnapshot(
						`간선 ${minNode.label}→${this.graph.getNode(targetId).label} 완화 (${oldDist} → ${newDist})`,
						minNode.id,
						{ source: minNode.id, target: targetId, weight: neighbor.weight },
					);
				}
			}
		}

		return this.getResult();
	}
}
