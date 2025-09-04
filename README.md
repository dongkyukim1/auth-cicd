# Auth Stack (Node.js + React + Redis + MongoDB + K8s + Grafana/Prometheus + Jenkins)

## 환경 변수(백엔드)
`backend/.env.example`를 복사해 `.env`를 만들고 값 채우기

- PORT=4000
- MONGO_URI=mongodb+srv://wlsntus55_db_user:4441@cluster0.mqjrmwm.mongodb.net/
- MONGO_DB_NAME=authdb
- JWT_SECRET / JWT_REFRESH_SECRET
- REDIS_URL=redis://127.0.0.1:6379
- SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM

## 로컬 실행
### Backend
```bash
cd backend
npm i
npm run dev
```

### Frontend
```bash
cd frontend
npm i
npm run dev
```

## Redis를 이용한 OTP
- POST /api/auth/send-code { email }
- POST /api/auth/register { email, name, password, code }

## Docker
```bash
cd backend && docker build -t auth-backend:local .
cd ../frontend && docker build -t auth-frontend:local .
```

## Kubernetes
```bash
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/monitoring/prometheus.yaml
kubectl apply -f k8s/monitoring/grafana.yaml
```
- Grafana는 LoadBalancer(3000), Prometheus는 ClusterIP(9090)
- 백엔드 Pod에는 `prometheus.io/*` 어노테이션이 있어 /metrics를 수집합니다.

## Jenkins
- 루트 `Jenkinsfile` 참고 (이미지 빌드/푸시/배포)

## 프론트엔드
- Vite dev server가 `/api`를 `http://3.34.52.239:8080`으로 프록시
- Pretendard 가중치에 따라 `fontFamily` 매핑
