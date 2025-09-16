import React from 'react';
import { Stage } from '../utils/dataProcessor';
import './StageSelector.css';

interface StageSelectorProps {
  stages: Stage[];
  onStageSelect: (stageId: number, mode: 'quiz' | 'writing') => void;
}

const StageSelector: React.FC<StageSelectorProps> = ({ stages, onStageSelect }) => {
  return (
    <div className="stage-selector">
      <h2>단계 선택</h2>
      <p>총 {stages.length}단계 중 학습을 진행하세요</p>

      <div className="stages-grid">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`stage-card ${stage.isCompleted ? 'completed' : ''} ${!stage.isUnlocked ? 'locked' : ''}`}
          >
            <div className="stage-header">
              <h3>단계 {stage.id}</h3>
              {stage.isCompleted && <span className="completed-badge">✓</span>}
            </div>

            <div className="stage-info">
              <p>{stage.items.length}개 문항</p>
              <p>진행률: {stage.isCompleted ? '100%' : '0%'}</p>
            </div>

            {stage.isUnlocked ? (
              <div className="stage-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => onStageSelect(stage.id, 'quiz')}
                >
                  객관식 퀴즈
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => onStageSelect(stage.id, 'writing')}
                >
                  주관식 쓰기
                </button>
              </div>
            ) : (
              <div className="stage-locked">
                <p>🔒 잠금 해제 필요</p>
                <small>이전 단계를 완료하세요</small>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StageSelector;