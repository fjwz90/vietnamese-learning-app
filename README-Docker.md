# 베트남어 학습 앱 - Docker 배포 가이드

이 가이드는 Docker를 사용하여 베트남어 학습 앱을 컨테이너화하고 실행하는 방법을 설명합니다.

## 📋 사전 요구사항

- Docker 설치 (https://docs.docker.com/get-docker/)
- Docker Compose 설치 (https://docs.docker.com/compose/install/)

## 🚀 Docker를 사용한 실행 방법

### 1. 이미지 빌드 및 컨테이너 실행

```bash
# 프로젝트 디렉토리로 이동
cd vietnamese-learning-app

# Docker Compose를 사용하여 빌드 및 실행
docker-compose up --build
```

### 2. 백그라운드에서 실행

```bash
# 백그라운드에서 실행
docker-compose up -d --build
```

### 3. 앱 접속

브라우저에서 다음 주소로 접속:
```
http://localhost:8080
```

## 🛠️ Docker 명령어

### 컨테이너 중지
```bash
docker-compose down
```

### 로그 확인
```bash
docker-compose logs -f
```

### 컨테이너 재시작
```bash
docker-compose restart
```

### 이미지 재빌드
```bash
docker-compose up --build --force-recreate
```

## 📁 프로젝트 구조

```
vietnamese-learning-app/
├── Dockerfile              # Docker 이미지 빌드 설정
├── docker-compose.yml      # Docker Compose 설정
├── .dockerignore          # Docker 빌드 시 제외할 파일들
├── public/                # 정적 파일들
│   └── data/
│       └── vietnamese-data.csv  # 학습 데이터
├── src/                   # React 소스 코드
└── package.json           # Node.js 설정
```

## 🔧 설정 변경

### 포트 변경
`docker-compose.yml` 파일에서 포트를 변경할 수 있습니다:

```yaml
ports:
  - "9090:80"  # 호스트:컨테이너
```

### 환경 변수
필요한 경우 `docker-compose.yml`에 환경 변수를 추가할 수 있습니다:

```yaml
environment:
  - NODE_ENV=production
  - REACT_APP_API_URL=https://api.example.com
```

## 📊 Docker 이미지 정보

- **Base Image**: Node.js 18 Alpine (빌드용)
- **Runtime Image**: Nginx Alpine (실행용)
- **포트**: 8080 (호스트) → 80 (컨테이너)
- **볼륨**: 없음 (정적 파일 앱)

## 🐛 문제 해결

### 빌드 실패 시
```bash
# 캐시 삭제 후 재빌드
docker system prune -f
docker-compose up --build --force-recreate
```

### 포트 충돌 시
```bash
# 사용 중인 포트 확인
docker-compose ps

# 다른 포트로 변경
# docker-compose.yml에서 ports 설정 수정
```

### 컨테이너 로그 확인
```bash
# 실시간 로그
docker-compose logs -f vietnamese-learning-app

# 최근 로그
docker-compose logs --tail=100 vietnamese-learning-app
```

## 🔒 보안 고려사항

- 프로덕션 배포 시 HTTPS 설정 고려
- 환경 변수로 민감한 정보 관리
- 정기적인 이미지 업데이트

## 📞 지원

문제가 발생하거나 도움이 필요한 경우 이슈를 생성해 주세요.