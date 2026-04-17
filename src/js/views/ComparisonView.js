import { EventTypes } from "../controllers/EventBus.js";
import GraphRenderer from "../renderers/GraphRenderer.js";

export default class ComparisonView {
	constructor(eventBus) {
		this.eventBus = eventBus;
		this.dijkstraRenderer = null;
		this.bellmanfordRenderer = null;
		this.leftPanel = null;
		this.rightPanel = null;
	}

	init(graph) {
		// DOM에서 좌/우 패널 찾기
		const dijkstraContainer = document.getElementById("dijkstra-graph");
		const bellmanfordContainer = document.getElementById("bellmanford-graph");

		if (!dijkstraContainer || !bellmanfordContainer) {
			console.error("ComparisonView: 그래프 컨테이너를 찾을 수 없습니다.");
			return;
		}

		// GraphRenderer 2개 생성
		this.dijkstraRenderer = new GraphRenderer(dijkstraContainer, this.eventBus);
		this.bellmanfordRenderer = new GraphRenderer(
			bellmanfordContainer,
			this.eventBus,
		);

		// 그래프 초기화
		this.dijkstraRenderer.init(graph);
		this.bellmanfordRenderer.init(graph);

		// 렌더링
		this.dijkstraRenderer.renderGraph(graph);
		this.bellmanfordRenderer.renderGraph(graph);

		// 스텝 변경 이벤트 구독
		this.eventBus.on(EventTypes.STEP_CHANGED, (data) => {
			this.updateStep(data.dijkstraStep, data.bellmanfordStep);
		});

		// 모바일 탭 전환 이벤트 설정
		this.setupTabSwitching();
	}

	updateStep(dijkstraStep, bellmanfordStep) {
		if (this.dijkstraRenderer && dijkstraStep) {
			this.dijkstraRenderer.updateStep(dijkstraStep);
		}
		if (this.bellmanfordRenderer && bellmanfordStep) {
			this.bellmanfordRenderer.updateStep(bellmanfordStep);
		}
	}

	loadGraph(graph) {
		if (this.dijkstraRenderer) {
			this.dijkstraRenderer.renderGraph(graph);
		}
		if (this.bellmanfordRenderer) {
			this.bellmanfordRenderer.renderGraph(graph);
		}
	}

	reset() {
		if (this.dijkstraRenderer) {
			this.dijkstraRenderer.reset();
		}
		if (this.bellmanfordRenderer) {
			this.bellmanfordRenderer.reset();
		}
	}

	setupTabSwitching() {
		const tabs = document.querySelectorAll(".tab-bar__btn");
		const dijkstraPanel = document.getElementById("dijkstra-panel");
		const bellmanfordPanel = document.getElementById("bellmanford-panel");

		if (!tabs.length || !dijkstraPanel || !bellmanfordPanel) {
			return;
		}

		tabs.forEach((tab) => {
			tab.addEventListener("click", () => {
				const panelName = tab.getAttribute("data-panel");

				// 탭 활성화 상태 업데이트
				tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
				tab.setAttribute("aria-selected", "true");

				// 패널 data-active 토글 (CSS가 display 관리)
				if (panelName === "dijkstra") {
					dijkstraPanel.setAttribute("data-active", "true");
					bellmanfordPanel.setAttribute("data-active", "false");
				} else {
					dijkstraPanel.setAttribute("data-active", "false");
					bellmanfordPanel.setAttribute("data-active", "true");
				}
			});
		});
	}
}
