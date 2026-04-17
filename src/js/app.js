import BellmanFordAlgorithm from "./algorithms/BellmanFordAlgorithm.js";
import DijkstraAlgorithm from "./algorithms/DijkstraAlgorithm.js";
import { EventTypes, eventBus } from "./controllers/EventBus.js";
import PlaybackController from "./controllers/PlaybackController.js";
import Graph from "./models/Graph.js";
import ComparisonView from "./views/ComparisonView.js";
import ExplanationPanel from "./views/ExplanationPanel.js";

class App {
	constructor() {
		this.graph = null;
		this.playback = null;
		this.comparison = null;
		this.explanation = null;
		this.currentPreset = "default";
	}

	init() {
		// 1. 뷰 초기화
		this.comparison = new ComparisonView(eventBus);
		this.explanation = new ExplanationPanel(eventBus);

		// 2. 첫 번째 프리셋 로드
		this.loadPreset("default");

		// 3. 컨트롤 버튼 이벤트 바인딩
		this.setupControls();

		// 4. 글로벌 이벤트 구독
		this.setupEventListeners();
	}

	loadPreset(name) {
		this.currentPreset = name;

		// 그래프 생성
		this.graph = Graph.createPreset(name);

		// 뷰에 그래프 로드
		this.comparison.init(this.graph);

		// 알고리즘 실행
		this.runAlgorithms();

		// 설명 패널 초기화
		this.explanation.init();
	}

	runAlgorithms() {
		// 알고리즘 인스턴스 생성
		const dijkstra = new DijkstraAlgorithm(this.graph);
		const bellmanford = new BellmanFordAlgorithm(this.graph);

		// 알고리즘 실행 (시작 노드: 'A')
		const dijkstraResult = dijkstra.run("A");
		const bellmanfordResult = bellmanford.run("A");

		// PlaybackController 생성 또는 업데이트
		if (!this.playback) {
			this.playback = new PlaybackController(eventBus);
		}

		// 스텝 데이터 설정
		this.playback.setSteps(dijkstraResult, bellmanfordResult);

		// 완료 이벤트 발행
		eventBus.emit(EventTypes.ALGORITHM_COMPLETED, {
			dijkstraResult,
			bellmanfordResult,
		});

		// 최종 비교 표시
		this.explanation.showComparison(dijkstraResult, bellmanfordResult);
	}

	setupControls() {
		// 재생/정지 버튼
		const playBtn = document.getElementById("btn-play");
		if (playBtn) {
			playBtn.addEventListener("click", () => {
				if (this.playback.isPlaying) {
					this.playback.pause();
				} else {
					this.playback.play();
				}
			});
		}

		// 처음으로 버튼
		const startBtn = document.getElementById("btn-start");
		if (startBtn) {
			startBtn.addEventListener("click", () => {
				this.playback.jumpToStart();
			});
		}

		// 이전 버튼
		const prevBtn = document.getElementById("btn-prev");
		if (prevBtn) {
			prevBtn.addEventListener("click", () => {
				this.playback.stepBackward();
			});
		}

		// 다음 버튼
		const nextBtn = document.getElementById("btn-next");
		if (nextBtn) {
			nextBtn.addEventListener("click", () => {
				this.playback.stepForward();
			});
		}

		// 끝으로 버튼
		const endBtn = document.getElementById("btn-end");
		if (endBtn) {
			endBtn.addEventListener("click", () => {
				this.playback.jumpToEnd();
			});
		}

		// 리셋 버튼
		const resetBtn = document.getElementById("btn-reset");
		if (resetBtn) {
			resetBtn.addEventListener("click", () => {
				this.comparison.reset();
				this.explanation.reset();
				this.playback.reset();
			});
		}

		// 속도 슬라이더
		const speedSlider = document.getElementById("speed-slider");
		const speedLabel = document.getElementById("speed-label");
		if (speedSlider && speedLabel) {
			speedSlider.addEventListener("input", (e) => {
				const multiplier = parseFloat(e.target.value);
				this.playback.setSpeed(multiplier);
				speedLabel.textContent = `${multiplier}x`;
				eventBus.emit(EventTypes.SPEED_CHANGED, { speed: multiplier });
			});
		}

		// 프리셋 선택
		const presetSelect = document.getElementById("preset-select");
		if (presetSelect) {
			presetSelect.addEventListener("change", (e) => {
				this.loadPreset(e.target.value);
			});
		}
	}

	setupEventListeners() {
		// 재생 상태 변경 시 버튼 UI 업데이트
		eventBus.on(EventTypes.PLAYBACK_STATE_CHANGED, (data) => {
			const playBtn = document.getElementById("btn-play");
			if (playBtn) {
				if (data.isPlaying) {
					playBtn.textContent = "⏸";
					playBtn.setAttribute("title", "일시정지");
				} else {
					playBtn.textContent = "▶";
					playBtn.setAttribute("title", "재생");
				}
			}
		});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const app = new App();
	app.init();
});
