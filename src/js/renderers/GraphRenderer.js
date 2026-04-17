class GraphRenderer {
	constructor(containerElement, eventBus) {
		this.container = containerElement;
		this.eventBus = eventBus;
		this.svg = null;
		this.nodeElements = new Map();
		this.edgeElements = new Map();
		this.labelElements = new Map();
		this.graph = null;
		this.width = 600;
		this.height = 460;
	}

	init(graph) {
		this.graph = graph;
		this._createSvg();
	}

	_createSvg() {
		// Clear container
		this.container.innerHTML = "";

		// Create SVG element with viewBox
		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
		this.svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
		this.svg.setAttribute("role", "img");
		this.svg.setAttribute("aria-label", "그래프 시각화");
		this.svg.classList.add("graph-svg");

		// Create defs with arrow marker
		const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
		const marker = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"marker",
		);
		marker.setAttribute("id", "arrowhead");
		marker.setAttribute("markerWidth", "10");
		marker.setAttribute("markerHeight", "7");
		marker.setAttribute("refX", "9");
		marker.setAttribute("refY", "3.5");
		marker.setAttribute("orient", "auto");

		const polygon = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"polygon",
		);
		polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
		polygon.setAttribute("fill", "var(--color-divider)");
		marker.appendChild(polygon);
		defs.appendChild(marker);
		this.svg.appendChild(defs);

		// Create layer groups
		const edgesLayer = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"g",
		);
		edgesLayer.classList.add("edges-layer");
		this.svg.appendChild(edgesLayer);

		const nodesLayer = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"g",
		);
		nodesLayer.classList.add("nodes-layer");
		this.svg.appendChild(nodesLayer);

		const labelsLayer = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"g",
		);
		labelsLayer.classList.add("labels-layer");
		this.svg.appendChild(labelsLayer);

		this.container.appendChild(this.svg);
	}

	renderGraph(graph) {
		this.graph = graph;

		if (!this.svg) {
			this._createSvg();
		}

		// Clear previous elements
		this.nodeElements.clear();
		this.edgeElements.clear();
		this.labelElements.clear();

		// Get layers
		const edgesLayer = this.svg.querySelector(".edges-layer");
		const nodesLayer = this.svg.querySelector(".nodes-layer");
		const labelsLayer = this.svg.querySelector(".labels-layer");

		// Clear layers
		edgesLayer.innerHTML = "";
		nodesLayer.innerHTML = "";
		labelsLayer.innerHTML = "";

		// Render edges first
		const edges = graph.getEdges();
		for (const edge of edges) {
			this._createEdge(edge, edgesLayer, labelsLayer);
		}

		// Render nodes
		const nodes = graph.getNodes();
		for (const node of nodes) {
			this._createNode(node, nodesLayer, labelsLayer);
		}

		// Auto-fit viewBox to graph bounding box
		this._fitViewBox(nodes);
	}

	_fitViewBox(nodes) {
		if (!nodes.length || !this.svg) return;
		const padding = 50;
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const node of nodes) {
			if (node.x < minX) minX = node.x;
			if (node.y < minY) minY = node.y;
			if (node.x > maxX) maxX = node.x;
			if (node.y > maxY) maxY = node.y;
		}
		const vbX = minX - padding;
		const vbY = minY - padding;
		const vbW = maxX - minX + padding * 2;
		const vbH = maxY - minY + padding * 2;
		this.svg.setAttribute("viewBox", `${vbX} ${vbY} ${vbW} ${vbH}`);
	}

	_createNode(node, nodesLayer, labelsLayer) {
		// Create circle for node
		const circle = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"circle",
		);
		circle.setAttribute("cx", node.x);
		circle.setAttribute("cy", node.y);
		circle.setAttribute("r", "20");
		circle.setAttribute("data-node-id", node.id);
		circle.classList.add("graph-node", "unvisited");

		nodesLayer.appendChild(circle);
		this.nodeElements.set(node.id, circle);

		// Create label for node
		const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.setAttribute("x", node.x);
		text.setAttribute("y", node.y);
		text.setAttribute("text-anchor", "middle");
		text.setAttribute("dy", "0.35em");
		text.setAttribute("data-node-id", node.id);
		text.classList.add("graph-node-label");
		text.textContent = node.label;

		labelsLayer.appendChild(text);
		this.labelElements.set(`label-${node.id}`, text);
	}

	_createEdge(edge, edgesLayer, labelsLayer) {
		const edgeKey = `${edge.source}-${edge.target}`;

		if (this.edgeElements.has(edgeKey)) {
			return; // Already created
		}

		const sourceNode = this.graph.getNode(edge.source);
		const targetNode = this.graph.getNode(edge.target);

		if (!sourceNode || !targetNode) {
			return;
		}

		// Create line for edge
		const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line.setAttribute("x1", sourceNode.x);
		line.setAttribute("y1", sourceNode.y);
		line.setAttribute("x2", targetNode.x);
		line.setAttribute("y2", targetNode.y);
		line.setAttribute("data-source", edge.source);
		line.setAttribute("data-target", edge.target);
		line.setAttribute("marker-end", "url(#arrowhead)");
		line.classList.add("graph-edge", "default");

		edgesLayer.appendChild(line);
		this.edgeElements.set(edgeKey, line);

		// Create weight label at midpoint
		const midX = (sourceNode.x + targetNode.x) / 2;
		const midY = (sourceNode.y + targetNode.y) / 2;

		const weightText = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"text",
		);
		weightText.setAttribute("x", midX);
		weightText.setAttribute("y", midY - 8);
		weightText.setAttribute("text-anchor", "middle");
		weightText.setAttribute("data-source", edge.source);
		weightText.setAttribute("data-target", edge.target);
		weightText.classList.add("graph-edge-label");
		if (edge.weight < 0) {
			weightText.classList.add("graph-edge-label--negative");
		}
		weightText.textContent = edge.weight;

		labelsLayer.appendChild(weightText);
		this.labelElements.set(`weight-${edgeKey}`, weightText);
	}

	updateStep(step) {
		if (!step) {
			return;
		}

		const distances =
			step.distances || (step.snapshot && step.snapshot.distances);
		const visited = step.visited || (step.snapshot && step.snapshot.visited);

		// Reset all edges to default first
		if (this.graph) {
			const edges = this.graph.getEdges();
			for (const edge of edges) {
				this._setEdgeState(edge.source, edge.target, "default");
			}
		}

		// Update node states
		if (this.graph) {
			const nodes = this.graph.getNodes();
			for (const node of nodes) {
				let state = "unvisited";

				if (node.id === step.current) {
					state = "processing";
				} else if (visited && visited.has(node.id)) {
					state = "settled";
				} else if (
					distances &&
					distances.has(node.id) &&
					distances.get(node.id) !== Infinity
				) {
					state = "candidate";
				}

				this._setNodeState(node.id, state);

				// Update distance label
				if (distances && distances.has(node.id)) {
					const distance = distances.get(node.id);
					this._updateDistanceLabel(node.id, distance);
				}
			}
		}

		// Update edge state for relaxed edge
		if (step.relaxedEdge) {
			this._setEdgeState(
				step.relaxedEdge.source,
				step.relaxedEdge.target,
				"relaxing",
			);
		}
	}

	_setNodeState(nodeId, state) {
		const circle = this.nodeElements.get(nodeId);
		if (circle) {
			circle.classList.remove(
				"unvisited",
				"candidate",
				"processing",
				"settled",
				"source",
				"neg-cycle",
				"path",
			);
			circle.classList.add(state);
		}
	}

	_setEdgeState(source, target, state) {
		const edgeKey = `${source}-${target}`;
		const line = this.edgeElements.get(edgeKey);
		if (line) {
			line.classList.remove("default", "relaxing", "shortest-path", "negative");
			line.classList.add(state);
		}
	}

	_updateDistanceLabel(nodeId, distance) {
		const node = this.graph.getNode(nodeId);
		if (node) {
			// Create or update distance label below node
			const labelKey = `distance-${nodeId}`;
			let distanceLabel = this.labelElements.get(labelKey);

			if (!distanceLabel) {
				distanceLabel = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"text",
				);
				distanceLabel.setAttribute("x", node.x);
				distanceLabel.setAttribute("y", node.y + 35);
				distanceLabel.setAttribute("text-anchor", "middle");
				distanceLabel.setAttribute("data-node-id", nodeId);
				distanceLabel.classList.add("graph-node-label", "distance-label");

				const labelsLayer = this.svg.querySelector(".labels-layer");
				labelsLayer.appendChild(distanceLabel);
				this.labelElements.set(labelKey, distanceLabel);
			}

			const displayDistance = distance === Infinity ? "∞" : distance;
			distanceLabel.textContent = displayDistance;
		}
	}

	clear() {
		if (this.svg) {
			this.svg.innerHTML = "";
		}
		this.nodeElements.clear();
		this.edgeElements.clear();
		this.labelElements.clear();
	}

	reset() {
		if (!this.graph) {
			return;
		}

		// Reset all nodes to unvisited state
		const nodes = this.graph.getNodes();
		for (const node of nodes) {
			this._setNodeState(node.id, "unvisited");
			const labelKey = `distance-${node.id}`;
			const distanceLabel = this.labelElements.get(labelKey);
			if (distanceLabel) {
				distanceLabel.remove();
				this.labelElements.delete(labelKey);
			}
		}

		// Reset all edges to default state
		const edges = this.graph.getEdges();
		for (const edge of edges) {
			this._setEdgeState(edge.source, edge.target, "default");
		}
	}
}

export default GraphRenderer;
