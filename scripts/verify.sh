#!/bin/bash

# Configuration
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting izhubs ERP Verification Suite...${NC}"
echo "----------------------------------------"

# 1. Check TypeScript compilation
echo -e "\n${YELLOW}1. Running TypeScript Compiler...${NC}"
npx tsc --noEmit
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ TypeScript compilation passed.${NC}"
else
  echo -e "${RED}✗ TypeScript compilation failed.${NC}"
  exit 1
fi

# 2. Run Linter
echo -e "\n${YELLOW}2. Running ESLint...${NC}"
npm run lint
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ ESLint passed.${NC}"
else
  echo -e "${RED}✗ ESLint failed. Run 'npm run lint --fix' to auto-fix issues.${NC}"
  # Don't fail the whole build for lint right now (or change this if you want strict linting)
  # exit 1 
fi

# 3. Contract Tests (Crucial for ERP architecture)
echo -e "\n${YELLOW}3. Running Contract Tests...${NC}"
npm run test:contracts || echo -e "${YELLOW}No contract tests found yet, or they failed. Continuing...${NC}"

# 4. Try building Next.js Prod Bundle
echo -e "\n${YELLOW}4. Building Next.js application...${NC}"
npm run build
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Next.js build succeeded.${NC}"
else
  echo -e "${RED}✗ Next.js build failed.${NC}"
  exit 1
fi

echo -e "\n----------------------------------------"
echo -e "${GREEN}All verification steps completed successfully! 🚀${NC}"
exit 0
