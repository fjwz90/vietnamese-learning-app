export interface VietnameseItem {
  id: number;
  vietnamese: string;
  korean: string;
  vietnameseSentence: string;
  koreanSentence: string;
  ttsUrl: string;
  imagesUrl: string;
}

export interface QuizItem extends VietnameseItem {
  options: { imageUrl: string; koreanMeaning: string }[]; // 4개의 옵션 (이미지 URL + 한국어 의미)
  correctIndex: number; // 정답 이미지의 인덱스
}

export interface Stage {
  id: number;
  items: VietnameseItem[];
  quizItems: QuizItem[];
  isCompleted: boolean;
  isUnlocked: boolean;
}

// 간단한 CSV 파서
const parseCSV = (csvText: string): any[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
};

// CSV 데이터를 파싱하여 VietnameseItem 배열로 변환
export const parseCSVData = (csvText: string): VietnameseItem[] => {
  const data = parseCSV(csvText);

  return data.map((row, index) => ({
    id: index + 1,
    vietnamese: row.Vietnamese || '',
    korean: row.Korean || '',
    vietnameseSentence: row.Vietnamese_Sentence || '',
    koreanSentence: row.Korean_Sentence || '',
    ttsUrl: row.tts_url || '',
    imagesUrl: row.images_url || '',
  }));
};

// 데이터를 37단계로 분배 (약 19-20개씩)
export const createStages = (items: VietnameseItem[]): Stage[] => {
  const ITEMS_PER_STAGE = 20;
  const stages: Stage[] = [];

  for (let i = 0; i < items.length; i += ITEMS_PER_STAGE) {
    const stageItems = items.slice(i, i + ITEMS_PER_STAGE);
    const stageId = Math.floor(i / ITEMS_PER_STAGE) + 1;

    // 객관식 퀴즈용 데이터 생성
    const quizItems = createQuizItems(stageItems, items);

    stages.push({
      id: stageId,
      items: stageItems,
      quizItems,
      isCompleted: false,
      isUnlocked: stageId === 1, // 첫 번째 단계만 잠금 해제
    });
  }

  return stages;
};

// 객관식 퀴즈용 데이터 생성 (각 문제마다 4개 옵션)
const createQuizItems = (stageItems: VietnameseItem[], allItems: VietnameseItem[]): QuizItem[] => {
  return stageItems.map(item => {
    const correctOption = {
      imageUrl: item.imagesUrl,
      koreanMeaning: item.koreanSentence
    };
    const wrongOptions = getRandomWrongOptions(item.id, allItems, 3);

    // 옵션 섞기
    const options = [correctOption, ...wrongOptions];
    const shuffledOptions = shuffleArray(options);
    const correctIndex = shuffledOptions.findIndex(option => option.imageUrl === item.imagesUrl);

    return {
      ...item,
      options: shuffledOptions,
      correctIndex,
    };
  });
};

// 랜덤 오답 옵션 3개 선택
const getRandomWrongOptions = (currentId: number, allItems: VietnameseItem[], count: number): { imageUrl: string; koreanMeaning: string }[] => {
  const wrongItems = allItems.filter(item => item.id !== currentId);
  const shuffled = shuffleArray(wrongItems);
  return shuffled.slice(0, count).map(item => ({
    imageUrl: item.imagesUrl,
    koreanMeaning: item.koreanSentence
  }));
};

// 랜덤 오답 이미지 3개 선택 (기존 함수 유지)
const getRandomWrongImages = (currentId: number, allItems: VietnameseItem[], count: number): string[] => {
  const wrongItems = allItems.filter(item => item.id !== currentId);
  const shuffled = shuffleArray(wrongItems);
  return shuffled.slice(0, count).map(item => item.imagesUrl);
};

// 배열 섞기 유틸리티 함수
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// LocalStorage에서 진행 상태 로드
export const loadProgress = (): { [stageId: number]: boolean } => {
  const saved = localStorage.getItem('vietnamese-learning-progress');
  return saved ? JSON.parse(saved) : {};
};

// LocalStorage에 진행 상태 저장
export const saveProgress = (progress: { [stageId: number]: boolean }): void => {
  localStorage.setItem('vietnamese-learning-progress', JSON.stringify(progress));
};

// 단계 잠금 해제 로직
export const updateStageUnlock = (stages: Stage[], completedStageId: number): Stage[] => {
  return stages.map(stage => ({
    ...stage,
    isUnlocked: stage.id <= completedStageId + 1,
  }));
};