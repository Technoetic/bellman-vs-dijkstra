class Graph {
	constructor(nodes = [], edges = [], directed = false) {
		this.nodes = new Map();
		this.edges = [];
		this.adjacencyList = new Map();
		this.directed = directed;

		nodes.forEach((node) => {
			this.addNode(node.id, node.label, node.x, node.y);
		});

		edges.forEach((edge) => {
			this.addEdge(edge.source, edge.target, edge.weight);
		});
	}

	addNode(id, label, x, y) {
		if (this.nodes.has(id)) {
			throw new Error(`Node with id "${id}" already exists`);
		}
		this.nodes.set(id, { id, label, x, y });
		this.adjacencyList.set(id, []);
	}

	addEdge(source, target, weight) {
		if (!this.nodes.has(source)) {
			throw new Error(`Source node "${source}" does not exist`);
		}
		if (!this.nodes.has(target)) {
			throw new Error(`Target node "${target}" does not exist`);
		}

		const edge = { source, target, weight };
		this.edges.push(edge);

		const neighbors = this.adjacencyList.get(source);
		neighbors.push({ target, weight });

		if (!this.directed) {
			const reverseNeighbors = this.adjacencyList.get(target);
			reverseNeighbors.push({ target: source, weight });
			this.edges.push({ source: target, target: source, weight });
		}
	}

	getNeighbors(nodeId) {
		if (!this.adjacencyList.has(nodeId)) {
			return [];
		}
		return this.adjacencyList.get(nodeId);
	}

	getNode(id) {
		return this.nodes.get(id) || null;
	}

	getNodes() {
		return Array.from(this.nodes.values());
	}

	getEdges() {
		return [...this.edges];
	}

	validate() {
		const nodeIds = new Set(this.nodes.keys());

		for (const edge of this.edges) {
			if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
				return false;
			}
		}

		return true;
	}

	clone() {
		const clonedGraph = new Graph([], [], this.directed);

		this.nodes.forEach((node) => {
			clonedGraph.addNode(node.id, node.label, node.x, node.y);
		});

		const addedEdges = new Set();
		this.edges.forEach((edge) => {
			const edgeKey = `${edge.source}-${edge.target}`;
			if (!addedEdges.has(edgeKey)) {
				clonedGraph.addEdge(edge.source, edge.target, edge.weight);
				addedEdges.add(edgeKey);
			}
		});

		return clonedGraph;
	}

	static createPreset(name) {
		if (name === "default") {
			const nodes = [
				{ id: "A", label: "A", x: 70, y: 230 },
				{ id: "B", label: "B", x: 220, y: 60 },
				{ id: "C", label: "C", x: 220, y: 390 },
				{ id: "D", label: "D", x: 400, y: 230 },
				{ id: "E", label: "E", x: 540, y: 400 },
			];

			const edges = [
				{ source: "A", target: "B", weight: 4 },
				{ source: "A", target: "C", weight: 2 },
				{ source: "B", target: "C", weight: 1 },
				{ source: "B", target: "D", weight: 5 },
				{ source: "C", target: "D", weight: 8 },
				{ source: "C", target: "E", weight: 10 },
				{ source: "D", target: "E", weight: 2 },
			];

			return new Graph(nodes, edges, true);
		}

		if (name === "negative-weights") {
			const nodes = [
				{ id: "A", label: "A", x: 70, y: 230 },
				{ id: "B", label: "B", x: 220, y: 60 },
				{ id: "C", label: "C", x: 220, y: 390 },
				{ id: "D", label: "D", x: 400, y: 230 },
				{ id: "E", label: "E", x: 540, y: 400 },
			];

			const edges = [
				{ source: "A", target: "B", weight: 4 },
				{ source: "A", target: "C", weight: 2 },
				{ source: "B", target: "C", weight: -3 },
				{ source: "B", target: "D", weight: 5 },
				{ source: "C", target: "D", weight: 8 },
				{ source: "C", target: "E", weight: 10 },
				{ source: "D", target: "E", weight: 2 },
			];

			return new Graph(nodes, edges, true);
		}

		if (name === "negative-cycle") {
			const nodes = [
				{ id: "A", label: "A", x: 70, y: 230 },
				{ id: "B", label: "B", x: 300, y: 60 },
				{ id: "C", label: "C", x: 300, y: 400 },
				{ id: "D", label: "D", x: 530, y: 230 },
			];

			// B→C→D→B 사이클 비용: -4+1+1 = -2 (음수 사이클)
			const edges = [
				{ source: "A", target: "B", weight: 1 },
				{ source: "B", target: "C", weight: -4 },
				{ source: "C", target: "D", weight: 1 },
				{ source: "D", target: "B", weight: 1 },
			];

			return new Graph(nodes, edges, true);
		}

		throw new Error(`Unknown preset name: ${name}`);
	}
}

export default Graph;
