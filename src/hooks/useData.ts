import { useState, useEffect } from 'react';
import { parseCSVData, createStages, loadProgress, saveProgress, updateStageUnlock, VietnameseItem, Stage } from '../utils/dataProcessor';

export const useData = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // CSV 파일 로드
        const response = await fetch('/data/vietnamese-data.csv');
        if (!response.ok) {
          throw new Error('CSV 파일을 로드할 수 없습니다.');
        }

        const csvText = await response.text();

        // CSV 파싱 및 단계 생성
        const items: VietnameseItem[] = parseCSVData(csvText);
        let initialStages = createStages(items);

        // 저장된 진행 상태 로드
        const savedProgress = loadProgress();

        // 진행 상태 적용
        initialStages = initialStages.map(stage => ({
          ...stage,
          isCompleted: savedProgress[stage.id] || false,
          isUnlocked: stage.id === 1 || (savedProgress[stage.id - 1] || false),
        }));

        setStages(initialStages);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 로드 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 단계 완료 처리
  const completeStage = (stageId: number) => {
    setStages(prevStages => {
      const updatedStages = updateStageUnlock(prevStages, stageId);
      const newStages = updatedStages.map(stage =>
        stage.id === stageId ? { ...stage, isCompleted: true } : stage
      );

      // 진행 상태 저장
      const progress: { [stageId: number]: boolean } = {};
      newStages.forEach(stage => {
        if (stage.isCompleted) {
          progress[stage.id] = true;
        }
      });
      saveProgress(progress);

      return newStages;
    });
  };

  return {
    stages,
    loading,
    error,
    completeStage,
  };
};