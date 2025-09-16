import React, { useState, useEffect } from 'react';
import { Stage } from '../utils/dataProcessor';
import './WritingMode.css';

interface WritingModeProps {
  stage: Stage;
  onComplete: () => void;
}

const WritingMode: React.FC<WritingModeProps> = ({ stage, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const currentQuestion = stage.items[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === stage.items.length - 1;

  // 힌트 생성 함수
  const generateHint = (correctAnswer: string, level: number): string => {
    if (level === 0) return '';
    if (level >= 5) return correctAnswer;

    const words = correctAnswer.split(' ');
    const hintWords = words.map((word, index) => {
      if (index < level) return word;
      return '_'.repeat(word.length);
    });

    return hintWords.join(' ');
  };

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

  // 답변 제출 처리
  const handleSubmit = () => {
    if (!userInput.trim()) return;

    const isCorrect = userInput.trim().toLowerCase() === currentQuestion.vietnameseSentence.toLowerCase();

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowResult(true);
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 4) {
        setHintLevel(5); // 전체 정답 표시
      } else {
        setHintLevel(prev => prev + 1);
      }
    }
  };

  // 다음 질문으로 이동
  const handleNextQuestion = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserInput('');
      setShowResult(false);
      setHintLevel(0);
      setAttempts(0);
    }
  };

  // TTS 다시 재생
  const handleReplayAudio = () => {
    playAudio(currentQuestion.ttsUrl);
  };

  // 컴포넌트 마운트 시 첫 번째 오디오 자동 재생
  useEffect(() => {
    if (currentQuestion && !showResult) {
      const timer = setTimeout(() => {
        playAudio(currentQuestion.ttsUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex]);

  if (!currentQuestion) {
    return <div>질문을 로드하는 중...</div>;
  }

  return (
    <div className="writing-mode">
      <div className="writing-header">
        <h2>주관식 쓰기 - 단계 {stage.id}</h2>
        <div className="writing-progress">
          <span>문제 {currentQuestionIndex + 1} / {stage.items.length}</span>
          <span>정답: {correctAnswers} / {currentQuestionIndex + (showResult ? 1 : 0)}</span>
        </div>
      </div>

      <div className="writing-content">
        <div className="question-section">
          <div className="image-container">
            <img
              src={currentQuestion.imagesUrl}
              alt="학습 이미지"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-image.png';
              }}
            />
            <div className="korean-meaning">
              {currentQuestion.koreanSentence}
            </div>
          </div>

          <div className="audio-controls">
            <button
              className="btn btn-secondary"
              onClick={handleReplayAudio}
              disabled={audioPlaying}
            >
              🔊 {audioPlaying ? '재생 중...' : '다시 듣기'}
            </button>
          </div>
        </div>

        <div className="input-section">
          <h4>베트남어로 써보세요:</h4>

          {hintLevel > 0 && !showResult && (
            <div className="hint-section">
              <p>힌트: {generateHint(currentQuestion.vietnameseSentence, hintLevel)}</p>
              <small>시도 횟수: {attempts}/5</small>
            </div>
          )}

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="베트남어 문장을 입력하세요..."
            disabled={showResult}
            className="answer-input"
            rows={3}
          />

          {!showResult ? (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!userInput.trim()}
            >
              제출하기
            </button>
          ) : (
            <div className="result-section">
              <div className="result-message success">
                <p>✅ 정답입니다!</p>
                <p className="correct-answer">{currentQuestion.vietnameseSentence}</p>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
              >
                {isLastQuestion ? '단계 완료' : '다음 문제'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingMode;