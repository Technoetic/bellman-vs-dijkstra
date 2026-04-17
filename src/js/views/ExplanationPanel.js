import { EventTypes } from "../controllers/EventBus.js";

export default class ExplanationPanel {
	constructor(eventBus) {
		this.eventBus = eventBus;
		this.dijkstraPanel = null;
		this.bellmanfordPanel = null;
	}

	init() {
		// DOM에서 설명 패널 찾기
		this.dijkstraPanel = document.getElementById("explain-dijkstra");
		this.bellmanfordPanel = document.getElementById("explain-bellmanford");

		if (!this.dijkstraPanel || !this.bellmanfordPanel) {
			console.error("ExplanationPanel: 설명 패널 요소를 찾을 수 없습니다.");
			return;
		}

		// 초기 상태
		this.reset();

		// 스텝 변경 이벤트 구독
		this.eventBus.on(EventTypes.STEP_CHANGED, (data) => {
			this.updateContent(
				data.dijkstraStep,
				data.bellmanfordStep,
				data.index,
				data.totalSteps,
			);
		});

		// 음수 사이클 감지 이벤트 구독
		this.eventBus.on(EventTypes.NEGATIVE_CYCLE_DETECTED, () => {
			this.showNegativeCycle();
		});
	}

	updateContent(dijkstraStep, bellmanfordStep, currentIndex, totalSteps) {
		if (dijkstraStep && this.dijkstraPanel) {
			const description = dijkstraStep.description || "대기 중";
			this.dijkstraPanel.innerHTML = `
        <strong>다익스트라:</strong>
        <span>${description}</span>
      `;
		}

		if (bellmanfordStep && this.bellmanfordPanel) {
			const description = bellmanfordStep.description || "대기 중";
			this.bellmanfordPanel.innerHTML = `
        <strong>벨만-포드:</strong>
        <span>${description}</span>
      `;
		}

		// 단계 카운터 업데이트
		this.updateStepCounter(currentIndex, totalSteps);
	}

	updateStep(stepData, algorithmType) {
		if (algorithmType === "dijkstra" && this.dijkstraPanel) {
			const description = stepData?.description || "대기 중";
			this.dijkstraPanel.innerHTML = `
        <strong>다익스트라:</strong>
        <span>${description}</span>
      `;
		} else if (algorithmType === "bellmanford" && this.bellmanfordPanel) {
			const description = stepData?.description || "대기 중";
			this.bellmanfordPanel.innerHTML = `
        <strong>벨만-포드:</strong>
        <span>${description}</span>
      `;
		}
	}

	updateStepCounter(currentIndex, totalSteps) {
		const counterElement = document.getElementById("step-counter");
		const currentStepEl = document.getElementById("current-step");
		const totalStepsEl = document.getElementById("total-steps");

		if (currentStepEl && totalStepsEl) {
			currentStepEl.textContent = currentIndex + 1;
			totalStepsEl.textContent = totalSteps;
		}
	}

	showNegativeCycle() {
		if (this.bellmanfordPanel) {
			this.bellmanfordPanel.innerHTML = `
        <strong style="color: var(--color-error);">벨만-포드:</strong>
        <span style="color: var(--color-error);">⚠️ 음수 사이클이 감지되었습니다!</span>
      `;
		}
	}

	showComparison(dijkstraResult, bellmanfordResult) {
		if (this.dijkstraPanel) {
			const dijkstraSteps = dijkstraResult?.steps?.length || 0;
			const dijkstraComplexity = "O(E + V log V)";
			this.dijkstraPanel.innerHTML = `
        <strong>다익스트라 완료:</strong>
        <span>${dijkstraSteps}단계, ${dijkstraComplexity}</span>
      `;
		}

		if (this.bellmanfordPanel) {
			const bellmanfordSteps = bellmanfordResult?.steps?.length || 0;
			const bellmanfordComplexity = "O(V × E)";
			const hasNegativeCycle = bellmanfordResult?.hasNegativeCycle || false;

			if (hasNegativeCycle) {
				this.bellmanfordPanel.innerHTML = `
          <strong style="color: var(--color-error);">벨만-포드 완료:</strong>
          <span style="color: var(--color-error);">⚠️ 음수 사이클 감지, ${bellmanfordComplexity}</span>
        `;
			} else {
				this.bellmanfordPanel.innerHTML = `
          <strong>벨만-포드 완료:</strong>
          <span>${bellmanfordSteps}단계, ${bellmanfordComplexity}</span>
        `;
			}
		}
	}

	reset() {
		if (this.dijkstraPanel) {
			this.dijkstraPanel.innerHTML = `
        <strong>다익스트라:</strong>
        <span>하단 ▶ 버튼으로 시작하세요</span>
      `;
		}

		if (this.bellmanfordPanel) {
			this.bellmanfordPanel.innerHTML = `
        <strong>벨만-포드:</strong>
        <span>하단 ▶ 버튼으로 시작하세요</span>
      `;
		}

		const currentStepEl = document.getElementById("current-step");
		const totalStepsEl = document.getElementById("total-steps");
		if (currentStepEl && totalStepsEl) {
			currentStepEl.textContent = "0";
			totalStepsEl.textContent = "0";
		}
	}
}
