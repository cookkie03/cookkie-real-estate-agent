"""
CRM Immobiliare - Services
Business logic and utility services
"""

from .property_scorer import PropertyScorer, ScoringWeights
from .suggested_queries import SuggestedQueriesGenerator, generate_suggested_queries

__all__ = [
    "PropertyScorer",
    "ScoringWeights",
    "SuggestedQueriesGenerator",
    "generate_suggested_queries",
]
