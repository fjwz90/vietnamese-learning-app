import React, { useState } from 'react';
import { useData } from './hooks/useData';
import StageSelector from './components/StageSelector';
import QuizMode from './components/QuizMode';
import WritingMode from './components/WritingMode';
import './App.css';

export type AppMode = 'stage-select' | 'quiz' | 'writing';

function App() {
  const { stages, loading, error, completeStage } = useData();
  const [currentMode, setCurrentMode] = useState<AppMode>('stage-select');
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const handleStageSelect = (stageId: number, mode: 'quiz' | 'writing') => {
    setSelectedStage(stageId);
    setCurrentMode(mode === 'quiz' ? 'quiz' : 'writing');
  };

  const handleBackToStages = () => {
    setCurrentMode('stage-select');
    setSelectedStage(null);
  };

  const handleStageComplete = (stageId: number) => {
    completeStage(stageId);
    handleBackToStages();
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>데이터를 로드하는 중...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentStage = selectedStage ? stages.find(s => s.id === selectedStage) : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>베트남어 학습 앱</h1>
        {currentMode !== 'stage-select' && (
          <button className="back-button" onClick={handleBackToStages}>
            ← 단계 선택으로 돌아가기
          </button>
        )}
      </header>

      <main className="app-main">
        {currentMode === 'stage-select' && (
          <StageSelector
            stages={stages}
            onStageSelect={handleStageSelect}
          />
        )}

        {currentMode === 'quiz' && currentStage && (
          <QuizMode
            stage={currentStage}
            onComplete={() => handleStageComplete(currentStage.id)}
          />
        )}

        {currentMode === 'writing' && currentStage && (
          <WritingMode
            stage={currentStage}
            onComplete={() => handleStageComplete(currentStage.id)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
