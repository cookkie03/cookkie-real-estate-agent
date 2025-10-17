# 🧪 Tests - CRM Immobiliare

## Overview

Test suite completa per il CRM Immobiliare, organizzata per tipo di test e modulo.

**Strategia di Testing**: Pyramid Testing con focus su unit tests, integration tests e E2E tests critici.

---

## 📁 Struttura

```
tests/
├── unit/                           # Unit tests (80% coverage target)
│   ├── backend/                    # Backend API tests (Jest)
│   │   ├── api-health.test.ts      # Health check endpoint
│   │   └── utils.test.ts           # Utility functions
│   ├── frontend/                   # Frontend UI tests (Jest + RTL)
│   │   ├── components.test.tsx     # Component tests
│   │   └── pages.test.tsx          # Page tests
│   ├── ai_tools/                   # AI tools tests (pytest)
│   │   └── test_example.py         # AI logic tests
│   └── scraping/                   # Scraping tests (pytest)
│       └── test_example.py         # Scraping logic tests
│
├── integration/                    # Integration tests (API + DB)
│   └── .gitkeep                    # WIP
│
├── e2e/                            # End-to-End tests (Playwright)
│   └── .gitkeep                    # WIP
│
├── fixtures/                       # Test data and fixtures
│   └── .gitkeep                    # Shared test data
│
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Backend Tests (Jest)

```bash
# Run all backend tests
cd backend
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Specific test file
npm test api-health.test.ts
```

### Frontend Tests (Jest + React Testing Library)

```bash
# Run all frontend tests
cd frontend
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Specific test file
npm test components.test.tsx
```

### AI Tools Tests (pytest)

```bash
# Run all AI tools tests
cd ai_tools
pytest

# Verbose output
pytest -v

# Coverage report
pytest --cov=. --cov-report=html

# Specific test file
pytest ../tests/unit/ai_tools/test_example.py

# Run specific markers
pytest -m unit          # Only unit tests
pytest -m "not slow"    # Skip slow tests
```

### Scraping Tests (pytest)

```bash
# Run all scraping tests
cd scraping
pytest

# Verbose output
pytest -v

# Coverage report
pytest --cov=. --cov-report=html

# Skip network tests
pytest -m "not network"
```

### Run All Tests

```bash
# From project root
./scripts/test-all.sh       # Linux/Mac
scripts\test-all.bat        # Windows
```

---

## 🧬 Test Strategy

### Test Pyramid

```
        /\
       /  \      E2E Tests (5%)
      /____\     - Critical user flows
     /      \    - Smoke tests
    /        \
   /__________\  Integration Tests (15%)
  /            \ - API + Database
 /              \ - Service integration
/________________\ Unit Tests (80%)
                  - Pure functions
                  - Components
                  - Business logic
```

### Coverage Targets

| Module | Target | Current | Status |
|--------|--------|---------|--------|
| Backend | 60% | TBD | 🔄 In Progress |
| Frontend | 70% | TBD | 🔄 In Progress |
| AI Tools | 50% | TBD | 🔄 In Progress |
| Scraping | 50% | TBD | 🔄 In Progress |

---

## 📖 Writing Tests

### Backend (Jest + TypeScript)

```typescript
// tests/unit/backend/example.test.ts
import { GET } from '@/app/api/endpoint/route'

describe('API Endpoint', () => {
  it('should return success response', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('success')
  })
})
```

### Frontend (Jest + React Testing Library)

```typescript
// tests/unit/frontend/component.test.tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)

    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### AI Tools (pytest + Python)

```python
# tests/unit/ai_tools/test_example.py
import pytest

def test_property_matching(sample_property, sample_client):
    """Test property matching logic"""
    assert sample_property['prezzo'] <= sample_client['budgetMax']

@pytest.mark.ai
def test_ai_logic():
    """Test AI-specific logic"""
    # Your test here
    pass

class TestMatchingAlgorithm:
    def test_score_calculation(self):
        """Test match score calculation"""
        score = calculate_match_score(property, client)
        assert 0 <= score <= 100
```

### Scraping (pytest + Python)

```python
# tests/unit/scraping/test_example.py
import pytest

@pytest.mark.unit
def test_url_validation():
    """Test URL validation logic"""
    url = "https://www.example.com/immobili"
    assert validate_url(url) is True

@pytest.mark.network
def test_scraping_real_data():
    """Test scraping with real network request"""
    # Mock or skip in CI
    pass
```

---

## 🏷️ Test Markers

### Jest (Backend/Frontend)

```typescript
// Use describe.skip to skip tests
describe.skip('Skipped test suite', () => {
  // ...
})

// Use it.only to run only this test
it.only('Run only this test', () => {
  // ...
})
```

### Pytest (AI Tools/Scraping)

```python
@pytest.mark.unit          # Unit tests
@pytest.mark.integration   # Integration tests
@pytest.mark.slow          # Slow tests
@pytest.mark.ai            # AI-specific tests
@pytest.mark.network       # Tests requiring network
@pytest.mark.scraping      # Scraping tests
```

**Run specific markers**:
```bash
pytest -m unit              # Only unit tests
pytest -m "not slow"        # Skip slow tests
pytest -m "ai or scraping"  # AI or scraping tests
```

---

## 🔧 Test Configuration

### Backend: `backend/jest.config.js`
- Test environment: `node`
- Coverage threshold: 50%
- Module aliases: `@/*`

### Frontend: `frontend/jest.config.js`
- Test environment: `jsdom`
- Coverage threshold: 60%
- React Testing Library setup
- Mock Next.js router

### AI Tools: `ai_tools/pytest.ini`
- Test discovery: `test_*.py`
- Coverage target: 50%
- Markers: unit, integration, slow, ai

### Scraping: `scraping/pytest.ini`
- Test discovery: `test_*.py`
- Coverage target: 50%
- Markers: unit, network, scraping

---

## 🔄 CI/CD Integration

### GitHub Actions

Tests run automatically on:
- ✅ Every push to `main` or `develop`
- ✅ Every pull request
- ✅ Manual workflow dispatch

**Workflows**:
- `.github/workflows/ci.yml` - Run all tests
- `.github/workflows/docker.yml` - Docker image builds
- `.github/workflows/cd.yml` - Deployment pipeline

### Coverage Reports

Coverage reports are uploaded to **Codecov** after each CI run:
- Backend coverage: `codecov.io/.../backend`
- Frontend coverage: `codecov.io/.../frontend`
- AI Tools coverage: `codecov.io/.../ai-tools`
- Scraping coverage: `codecov.io/.../scraping`

---

## 🧪 Testing Best Practices

### 1. Test Naming Convention

```typescript
// ✅ GOOD
describe('PropertyList component', () => {
  it('should render list of properties', () => {})
  it('should filter properties by price', () => {})
})

// ❌ BAD
describe('test1', () => {
  it('test', () => {})
})
```

### 2. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should calculate total price', () => {
  // Arrange
  const price = 150000
  const tax = 0.1

  // Act
  const total = calculateTotal(price, tax)

  // Assert
  expect(total).toBe(165000)
})
```

### 3. Use Fixtures/Mocks

```typescript
// Use shared fixtures
import { sampleProperty } from '@/tests/fixtures/properties'

it('should use fixture data', () => {
  expect(sampleProperty.price).toBeGreaterThan(0)
})
```

### 4. Test One Thing at a Time

```typescript
// ✅ GOOD - Single assertion
it('should have correct title', () => {
  expect(property.title).toBe('Appartamento Milano')
})

it('should have correct price', () => {
  expect(property.price).toBe(150000)
})

// ❌ BAD - Multiple unrelated assertions
it('should be valid', () => {
  expect(property.title).toBe('Appartamento Milano')
  expect(property.price).toBe(150000)
  expect(property.city).toBe('Milano')
})
```

### 5. Mock External Dependencies

```typescript
// Mock database
jest.mock('@/lib/db', () => ({
  prisma: {
    property: {
      findMany: jest.fn(() => Promise.resolve([]))
    }
  }
}))

// Mock API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'test' })
  })
)
```

---

## 📊 Coverage Reports

### Generate HTML Coverage Reports

```bash
# Backend
cd backend && npm test -- --coverage
open coverage/lcov-report/index.html

# Frontend
cd frontend && npm test -- --coverage
open coverage/lcov-report/index.html

# AI Tools
cd ai_tools && pytest --cov=. --cov-report=html
open htmlcov/index.html

# Scraping
cd scraping && pytest --cov=. --cov-report=html
open htmlcov/index.html
```

---

## 🐛 Debugging Tests

### Jest (Backend/Frontend)

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Use debugger statement
it('should debug', () => {
  debugger; // Breakpoint here
  expect(true).toBe(true)
})
```

### Pytest (AI Tools/Scraping)

```bash
# Run with verbose output
pytest -vv

# Run with print statements
pytest -s

# Drop into debugger on failure
pytest --pdb

# Use breakpoint()
def test_debug():
    breakpoint()  # Python 3.7+
    assert True
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Testing Best Practices](https://testingjavascript.com/)

---

## 🎯 Next Steps

### Integration Tests (Phase 6.1)
- [ ] API + Database integration tests
- [ ] Service-to-service communication tests
- [ ] Error handling scenarios

### E2E Tests (Phase 6.2)
- [ ] Setup Playwright
- [ ] Critical user flow tests
- [ ] Cross-browser testing

### Performance Tests (Phase 6.3)
- [ ] Load testing with k6
- [ ] API response time tests
- [ ] Database query optimization

---

**Test Coverage Goal**: 70% overall by end of Phase 6

**Current Status**: 🔄 In Progress (Phase 6 - Testing & CI/CD)
