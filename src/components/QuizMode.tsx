import React, { useState, useEffect } from 'react';
import { Stage } from '../utils/dataProcessor';
import './QuizMode.css';

interface QuizModeProps {
  stage: Stage;
  onComplete: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ stage, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const currentQuestion = stage.quizItems[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === stage.quizItems.length - 1;

  // TTS 재생 함수
  const playAudio = async (url: string) => {
    if (audioPlaying) return;

    try {
      setAudioPlaying(true);
      const audio = new Audio(url);
      audio.onended = () => setAudioPlaying(false);
      audio.onerror = () => setAudioPlaying(false);
      await audio.play();
    } catch (error) {
      console.error('오디오 재생 실패:', error);
      setAudioPlaying(false);
    }
  };

  // 답변 선택 처리
  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === currentQuestion.correctIndex) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  // 다음 질문으로 이동
  const handleNextQuestion = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  // TTS 다시 재생
  const handleReplayAudio = () => {
    playAudio(currentQuestion.ttsUrl);
  };

  // 컴포넌트 마운트 시 첫 번째 오디오 자동 재생, 다음 질문으로 넘어가면 재생
  useEffect(() => {
    if (currentQuestion && !showResult) {
      const timer = setTimeout(() => {
        playAudio(currentQuestion.ttsUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, showResult]);

  if (!currentQuestion) {
    return <div>질문을 로드하는 중...</div>;
  }

  return (
    <div className="quiz-mode">
      <div className="quiz-header">
        <h2>객관식 퀴즈 - 단계 {stage.id}</h2>
        <div className="quiz-progress">
          <span>문제 {currentQuestionIndex + 1} / {stage.quizItems.length}</span>
          <span>정답: {correctAnswers} / {currentQuestionIndex + (showResult ? 1 : 0)}</span>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-section">
          <div className="vietnamese-sentence">
            <h3
              onClick={handleReplayAudio}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              {currentQuestion.vietnameseSentence}
            </h3>
          </div>
        </div>

        <div className="options-section">
          <div className="options-grid">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`option-card ${
                  showResult
                    ? index === currentQuestion.correctIndex
                      ? 'correct'
                      : index === selectedAnswer
                      ? 'incorrect'
                      : ''
                    : selectedAnswer === index
                    ? 'selected'
                    : ''
                }`}
                onClick={() => handleAnswerSelect(index)}
              >
                <img
                  src={option.imageUrl}
                  alt={`옵션 ${index + 1}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png'; // 대체 이미지
                  }}
                />
                <div className="korean-text">
                  {option.koreanMeaning}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showResult && (
          <div className="result-section">
            <button
              className={`result-button ${selectedAnswer === currentQuestion.correctIndex ? 'success' : 'error'}`}
              onClick={handleNextQuestion}
            >
              {selectedAnswer === currentQuestion.correctIndex ? '✅정답 - 다음' : '❌ 오답 - 다음'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizMode;