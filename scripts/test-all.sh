#!/bin/bash

# ==============================================
# CRM Immobiliare - Test Suite Completa
# Linux/macOS Test Script
# ==============================================

set -e

echo "=========================================="
echo "CRM Immobiliare - Test Suite"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILURES=0

run_test() {
    local test_name=$1
    local test_command=$2

    echo -e "${YELLOW}▶ Running: $test_name${NC}"
    if eval "$test_command"; then
        echo -e "${GREEN}✓ $test_name: PASSED${NC}"
    else
        echo -e "${RED}✗ $test_name: FAILED${NC}"
        FAILURES=$((FAILURES + 1))
    fi
    echo ""
}

# Backend Tests
echo "========== Backend Tests =========="
cd backend
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    run_test "Backend Unit Tests" "npm test"
else
    echo -e "${YELLOW}⚠ No backend tests configured${NC}"
    echo ""
fi
cd ..

# Frontend Tests
echo "========== Frontend Tests =========="
cd frontend
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    run_test "Frontend Unit Tests" "npm test"
else
    echo -e "${YELLOW}⚠ No frontend tests configured${NC}"
    echo ""
fi
cd ..

# AI Tools Tests
echo "========== AI Tools Tests =========="
if command -v python3 &> /dev/null && [ -f "ai_tools/requirements.txt" ]; then
    cd ai_tools
    if [ -d "tests" ]; then
        run_test "AI Tools Tests" "python3 -m pytest tests/ -v"
    else
        echo -e "${YELLOW}⚠ No AI tools tests found${NC}"
        echo ""
    fi
    cd ..
else
    echo -e "${YELLOW}⚠ Python or ai_tools not available${NC}"
    echo ""
fi

# Scraping Tests
echo "========== Scraping Tests =========="
if command -v python3 &> /dev/null && [ -f "scraping/requirements.txt" ]; then
    cd scraping
    if [ -d "tests" ]; then
        run_test "Scraping Tests" "python3 -m pytest tests/ -v"
    else
        echo -e "${YELLOW}⚠ No scraping tests found${NC}"
        echo ""
    fi
    cd ..
else
    echo -e "${YELLOW}⚠ Python or scraping not available${NC}"
    echo ""
fi

# Summary
echo "=========================================="
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo "=========================================="
    exit 0
else
    echo -e "${RED}✗ $FAILURES test suite(s) failed${NC}"
    echo "=========================================="
    exit 1
fi
