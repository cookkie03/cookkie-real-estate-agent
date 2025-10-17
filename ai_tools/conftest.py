# ==============================================
# Pytest Configuration - AI Tools
# Shared fixtures and setup
# ==============================================

import pytest
import os
from pathlib import Path

# Set test environment
os.environ['ENVIRONMENT'] = 'test'

@pytest.fixture(scope='session')
def test_data_dir():
    """Return path to test data directory"""
    return Path(__file__).parent.parent / 'tests' / 'fixtures'

@pytest.fixture(scope='function')
def mock_database():
    """Mock database connection for tests"""
    # Setup mock database
    db = {'properties': [], 'clients': []}
    yield db
    # Teardown
    db.clear()

@pytest.fixture(scope='function')
def sample_property():
    """Sample property data for testing"""
    return {
        'id': '1',
        'titolo': 'Appartamento Centro',
        'prezzo': 150000,
        'superficie': 80,
        'locali': 3,
        'citta': 'Milano'
    }

@pytest.fixture(scope='function')
def sample_client():
    """Sample client data for testing"""
    return {
        'id': '1',
        'nome': 'Mario',
        'cognome': 'Rossi',
        'email': 'mario.rossi@example.com',
        'telefono': '+39 123 456 7890',
        'budgetMax': 200000
    }

@pytest.fixture(autouse=True)
def reset_environment():
    """Reset environment after each test"""
    yield
    # Cleanup after test
    pass
