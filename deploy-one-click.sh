#!/bin/bash

# ================================================
# GitHub CLI + SSH 기반 원클릭 배포 스크립트
# Coolify 서버에 SSH로 직접 접속하여 프로젝트 생성
# ================================================

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 기본 설정
COOLIFY_SERVER="141.164.60.51"
COOLIFY_URL="https://coolify.one-q.xyz"
GITHUB_USER="${GITHUB_USER:-dungeun}"
BASE_DOMAIN="one-q.kr"
SSH_USER="root"

# 로그 함수
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_debug() {
    echo -e "${CYAN}🔍 $1${NC}"
}

# SSH 연결 테스트
test_ssh_connection() {
    log_info "SSH 연결 테스트 중..."
    
    if ssh -o ConnectTimeout=5 -o BatchMode=yes $SSH_USER@$COOLIFY_SERVER "echo 'SSH OK'" &>/dev/null; then
        log_success "SSH 연결 성공"
        return 0
    else
        log_error "SSH 연결 실패. SSH 키를 확인하세요."
        echo "다음 명령으로 SSH 키를 복사하세요:"
        echo "ssh-copy-id $SSH_USER@$COOLIFY_SERVER"
        return 1
    fi
}

# GitHub CLI 확인
check_github_cli() {
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI가 설치되지 않았습니다."
        echo "설치 명령: brew install gh"
        exit 1
    fi
    
    # GitHub 인증 확인
    if ! gh auth status &>/dev/null; then
        log_warning "GitHub 로그인이 필요합니다."
        gh auth login
    fi
    
    log_success "GitHub CLI 준비 완료"
}

# GitHub 리포지토리 생성
create_github_repo() {
    local project_name=$1
    local is_private=${2:-false}
    
    log_info "GitHub 리포지토리 생성 중: $project_name"
    
    # 리포지토리 존재 확인
    if gh repo view "$GITHUB_USER/$project_name" &>/dev/null; then
        log_warning "리포지토리가 이미 존재합니다: $GITHUB_USER/$project_name"
        return 0
    fi
    
    # 리포지토리 생성
    local visibility="public"
    [ "$is_private" = "true" ] && visibility="private"
    
    gh repo create "$project_name" \
        --$visibility \
        --description "Auto-deployed with Coolify" \
        --clone=false || {
            log_error "GitHub 리포지토리 생성 실패"
            return 1
        }
    
    log_success "GitHub 리포지토리 생성 완료: https://github.com/$GITHUB_USER/$project_name"
    
    # Git 초기화 및 푸시
    if [ ! -d .git ]; then
        git init
        
        # .gitignore 생성
        create_gitignore "$PROJECT_TYPE"
        
        git add .
        git commit -m "Initial commit: Auto-deployed project" || true
        git branch -M main
        git remote add origin "https://github.com/$GITHUB_USER/$project_name.git" 2>/dev/null || true
        git push -u origin main || {
            log_warning "푸시 실패. 수동으로 푸시해주세요."
        }
    fi
}

# .gitignore 생성
create_gitignore() {
    local project_type=$1
    
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/
out/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# IDE
.vscode/
.idea/

# Next.js
.next/
*.tsbuildinfo
next-env.d.ts
EOF
    
    log_success ".gitignore 생성 완료"
}

# Coolify에서 프로젝트 확인
check_coolify_project() {
    local project_name=$1
    
    log_info "Coolify에서 기존 프로젝트 확인 중..."
    
    # Docker 컨테이너 목록 확인
    local containers=$(ssh $SSH_USER@$COOLIFY_SERVER "docker ps -a --format 'table {{.Names}}' | grep -i '$project_name' || true")
    
    if [ -n "$containers" ]; then
        log_warning "Coolify에 관련 컨테이너가 있습니다:"
        echo "$containers"
        
        # 상태 확인
        local exited=$(ssh $SSH_USER@$COOLIFY_SERVER "docker ps -a --filter 'status=exited' --format '{{.Names}}' | grep -i '$project_name' || true")
        
        if [ -n "$exited" ]; then
            log_warning "중지된 컨테이너가 있습니다. 재시작을 시도합니다..."
            recover_coolify_project "$project_name"
        fi
    fi
}

# Coolify 프로젝트 복구
recover_coolify_project() {
    local project_name=$1
    
    log_info "프로젝트 복구 시작..."
    
    # 컨테이너 재시작
    ssh $SSH_USER@$COOLIFY_SERVER "docker ps -a --format '{{.Names}}' | grep -i '$project_name' | xargs -r docker restart" || {
        log_warning "컨테이너 재시작 실패"
    }
    
    sleep 5
    
    # 상태 확인
    local running=$(ssh $SSH_USER@$COOLIFY_SERVER "docker ps --format '{{.Names}}' | grep -i '$project_name' || true")
    
    if [ -n "$running" ]; then
        log_success "프로젝트 복구 성공"
    else
        log_warning "자동 복구 실패. Coolify 웹 UI에서 확인해주세요."
    fi
}

# Coolify 데이터베이스 직접 접근 (문제 해결용)
fix_coolify_database() {
    local project_name=$1
    
    log_info "Coolify 데이터베이스 확인 중..."
    
    # Coolify 데이터베이스 컨테이너 확인
    ssh $SSH_USER@$COOLIFY_SERVER << 'EOF'
        # Coolify DB 컨테이너 찾기
        COOLIFY_DB=$(docker ps --format "{{.Names}}" | grep -E "coolify-db|postgres" | head -1)
        
        if [ -n "$COOLIFY_DB" ]; then
            echo "Coolify 데이터베이스 발견: $COOLIFY_DB"
            
            # 프로젝트 테이블 확인 (필요시)
            # docker exec -it $COOLIFY_DB psql -U coolify -d coolify -c "SELECT name FROM projects;"
        else
            echo "Coolify 데이터베이스를 찾을 수 없습니다."
        fi
EOF
}

# Docker Compose 파일 생성 (프로젝트 타입별)
create_docker_compose() {
    local project_name=$1
    local project_type=$2
    local db_type=$3
    
    log_info "Docker Compose 파일 생성 중..."
    
    case "$project_type" in
        "nextjs")
            create_nextjs_compose "$project_name" "$db_type"
            ;;
        "nodejs")
            create_nodejs_compose "$project_name" "$db_type"
            ;;
        *)
            log_warning "Docker Compose 파일을 수동으로 생성해주세요."
            ;;
    esac
}

# Next.js Docker Compose 생성
create_nextjs_compose() {
    local project_name=$1
    local db_type=$2
    
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - NEXTAUTH_URL=https://${project_name}.${BASE_DOMAIN}
      - NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}
    restart: unless-stopped
EOF
    
    if [ "$db_type" = "postgresql" ]; then
        cat >> docker-compose.yml << EOF
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=\${DB_USER:-postgres}
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
      - POSTGRES_DB=\${DB_NAME:-${project_name}}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
EOF
    fi
    
    # Dockerfile 생성
    cat > Dockerfile << 'EOF'
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
EOF
    
    log_success "Docker Compose 및 Dockerfile 생성 완료"
}

# Coolify에서 수동 설정 안내
provide_coolify_instructions() {
    local project_name=$1
    local github_repo="$GITHUB_USER/$project_name"
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🚀 Coolify 웹 UI에서 다음 단계를 진행하세요:${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}1. Coolify 접속:${NC} $COOLIFY_URL"
    echo ""
    echo -e "${YELLOW}2. 새 프로젝트 생성:${NC}"
    echo "   • Projects → + New → 프로젝트명: $project_name"
    echo ""
    echo -e "${YELLOW}3. 새 리소스 추가:${NC}"
    echo "   • + New → Application"
    echo "   • Source: Public Repository"
    echo "   • Repository: https://github.com/$github_repo"
    echo "   • Branch: main"
    echo "   • Build Pack: Docker Compose (중요!)"
    echo ""
    echo -e "${YELLOW}4. 환경변수 설정:${NC}"
    echo "   • Environment Variables 탭에서 추가:"
    echo "   • DATABASE_URL=postgresql://user:pass@db:5432/dbname"
    echo "   • NEXTAUTH_SECRET=$(openssl rand -base64 32)"
    echo ""
    echo -e "${YELLOW}5. 도메인 설정:${NC}"
    echo "   • Domains: ${project_name}.${BASE_DOMAIN}"
    echo ""
    echo -e "${YELLOW}6. 배포:${NC}"
    echo "   • Deploy 버튼 클릭"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # 자동 모니터링 옵션
    read -p "배포 상태를 모니터링할까요? (y/N): " monitor_choice
    if [ "$monitor_choice" = "y" ] || [ "$monitor_choice" = "Y" ]; then
        monitor_deployment "$project_name"
    fi
}

# 배포 모니터링
monitor_deployment() {
    local project_name=$1
    
    log_info "배포 모니터링 시작... (Ctrl+C로 종료)"
    
    while true; do
        # Docker 컨테이너 상태 확인
        ssh $SSH_USER@$COOLIFY_SERVER "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -i '$project_name' || echo '대기 중...'"
        
        sleep 10
    done
}

# DNS 레코드 생성 안내
setup_dns_instructions() {
    local subdomain=$1
    
    echo ""
    echo -e "${YELLOW}📌 DNS 설정 (선택사항):${NC}"
    echo ""
    echo "PowerDNS 또는 Cloudflare에서 다음 레코드 추가:"
    echo "• A 레코드: ${subdomain}.${BASE_DOMAIN} → $COOLIFY_SERVER"
    echo "• CNAME: www.${subdomain}.${BASE_DOMAIN} → ${subdomain}.${BASE_DOMAIN}"
    echo ""
}

# 프로젝트 타입별 초기 파일 생성
create_initial_files() {
    local project_type=$1
    local project_name=$2
    
    case "$project_type" in
        "nextjs")
            if [ ! -f "package.json" ]; then
                log_info "Next.js 프로젝트 초기화..."
                npx create-next-app@latest . --typescript --tailwind --app --no-eslint
            fi
            ;;
        "nodejs")
            if [ ! -f "package.json" ]; then
                log_info "Node.js 프로젝트 초기화..."
                npm init -y
                echo "console.log('Hello from $project_name');" > index.js
            fi
            ;;
        "static")
            if [ ! -f "index.html" ]; then
                log_info "정적 사이트 초기화..."
                cat > index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>$project_name</title>
</head>
<body>
    <h1>Welcome to $project_name</h1>
    <p>Auto-deployed with Coolify</p>
</body>
</html>
EOF
            fi
            ;;
    esac
}

# Coolify 프로젝트 리스트 문제 해결
troubleshoot_project_list() {
    log_info "Coolify 프로젝트 리스트 문제 해결 중..."
    
    echo ""
    echo -e "${YELLOW}🔧 프로젝트가 리스트에 안 보이는 경우:${NC}"
    echo ""
    echo "1. Coolify 데이터베이스 확인:"
    echo "   ssh $SSH_USER@$COOLIFY_SERVER"
    echo "   docker exec -it coolify-db psql -U coolify -d coolify"
    echo "   \\dt projects;"
    echo ""
    echo "2. Docker 네트워크 확인:"
    echo "   docker network inspect coolify"
    echo ""
    echo "3. Coolify 서비스 재시작:"
    echo "   docker restart coolify"
    echo ""
    echo "4. 브라우저 캐시 삭제 후 재접속"
    echo ""
    echo "5. Laravel 캐시 클리어 (Coolify 컨테이너에서):"
    echo "   docker exec -it coolify php artisan cache:clear"
    echo "   docker exec -it coolify php artisan config:clear"
    echo ""
}

# 메인 실행 함수
main() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║         🚀 GitHub CLI + SSH 기반 원클릭 배포 시스템          ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # 파라미터 파싱
    PROJECT_NAME=""
    PROJECT_TYPE="nextjs"
    DB_TYPE="postgresql"
    IS_PRIVATE=false
    SKIP_GITHUB=false
    TROUBLESHOOT=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --name)
                PROJECT_NAME="$2"
                shift 2
                ;;
            --type)
                PROJECT_TYPE="$2"
                shift 2
                ;;
            --db)
                DB_TYPE="$2"
                shift 2
                ;;
            --private)
                IS_PRIVATE=true
                shift
                ;;
            --skip-github)
                SKIP_GITHUB=true
                shift
                ;;
            --troubleshoot)
                TROUBLESHOOT=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 문제 해결 모드
    if [ "$TROUBLESHOOT" = true ]; then
        troubleshoot_project_list
        exit 0
    fi
    
    # 대화형 모드
    if [ -z "$PROJECT_NAME" ]; then
        echo ""
        read -p "프로젝트 이름: " PROJECT_NAME
        
        echo ""
        echo "프로젝트 타입 선택:"
        echo "1) Next.js"
        echo "2) Node.js"
        echo "3) Static HTML"
        echo "4) Docker (Custom)"
        read -p "선택 (1-4): " type_choice
        
        case "$type_choice" in
            1) PROJECT_TYPE="nextjs" ;;
            2) PROJECT_TYPE="nodejs" ;;
            3) PROJECT_TYPE="static" ;;
            4) PROJECT_TYPE="docker" ;;
        esac
        
        if [ "$PROJECT_TYPE" != "static" ]; then
            echo ""
            echo "데이터베이스 선택:"
            echo "1) PostgreSQL"
            echo "2) MySQL"
            echo "3) MongoDB"
            echo "4) 없음"
            read -p "선택 (1-4): " db_choice
            
            case "$db_choice" in
                1) DB_TYPE="postgresql" ;;
                2) DB_TYPE="mysql" ;;
                3) DB_TYPE="mongodb" ;;
                4) DB_TYPE="none" ;;
            esac
        else
            DB_TYPE="none"
        fi
        
        echo ""
        read -p "Private 리포지토리? (y/N): " private_choice
        if [ "$private_choice" = "y" ] || [ "$private_choice" = "Y" ]; then
            IS_PRIVATE=true
        fi
    fi
    
    echo ""
    log_info "배포 시작: $PROJECT_NAME"
    echo "• 타입: $PROJECT_TYPE"
    echo "• 데이터베이스: $DB_TYPE"
    echo "• Private: $IS_PRIVATE"
    echo ""
    
    # 1. SSH 연결 테스트
    test_ssh_connection || exit 1
    
    # 2. GitHub CLI 확인
    if [ "$SKIP_GITHUB" != true ]; then
        check_github_cli
    fi
    
    # 3. 초기 파일 생성
    create_initial_files "$PROJECT_TYPE" "$PROJECT_NAME"
    
    # 4. Docker Compose 생성
    create_docker_compose "$PROJECT_NAME" "$PROJECT_TYPE" "$DB_TYPE"
    
    # 5. GitHub 리포지토리 생성
    if [ "$SKIP_GITHUB" != true ]; then
        create_github_repo "$PROJECT_NAME" "$IS_PRIVATE"
    fi
    
    # 6. Coolify 프로젝트 확인
    check_coolify_project "$PROJECT_NAME"
    
    # 7. Coolify 설정 안내
    provide_coolify_instructions "$PROJECT_NAME"
    
    # 8. DNS 설정 안내
    setup_dns_instructions "$PROJECT_NAME"
    
    echo ""
    log_success "준비 완료! Coolify 웹 UI에서 배포를 진행하세요."
    echo ""
    echo -e "${GREEN}📚 추가 도움말:${NC}"
    echo "• 문제 해결: $0 --troubleshoot"
    echo "• Coolify 대시보드: $COOLIFY_URL"
    echo "• GitHub 리포지토리: https://github.com/$GITHUB_USER/$PROJECT_NAME"
    echo ""
}

# 도움말 표시
show_help() {
    cat << EOF
사용법: $0 [옵션]

옵션:
  --name <name>        프로젝트 이름
  --type <type>        프로젝트 타입 (nextjs|nodejs|static|docker)
  --db <type>          데이터베이스 타입 (postgresql|mysql|mongodb|none)
  --private            Private 리포지토리로 생성
  --skip-github        GitHub 리포지토리 생성 건너뛰기
  --troubleshoot       프로젝트 리스트 문제 해결 가이드
  --help               도움말 표시

예시:
  $0 --name my-app --type nextjs --db postgresql
  $0 --troubleshoot
  $0  # 대화형 모드

문제 해결:
  프로젝트가 Coolify 리스트에 안 보이는 경우:
  $0 --troubleshoot

SSH 설정:
  ssh-copy-id root@141.164.60.51
EOF
}

# 스크립트 실행
main "$@"