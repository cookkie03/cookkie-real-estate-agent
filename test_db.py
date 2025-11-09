"""Quick database test"""
import sys
from pathlib import Path

# Add database module to path
sys.path.insert(0, str(Path(__file__).parent / "database" / "python"))

from database import check_db_connection, get_db_context
from models import ScrapingJob, AgentConversation, Property

print("🔍 Testing database connection...")

# Test connection
if check_db_connection():
    print("✅ Database connection successful")
else:
    print("❌ Database connection failed")
    sys.exit(1)

# Test tables
print("\n🔍 Testing tables...")
with get_db_context() as db:
    # Count records in each table
    scraping_jobs = db.query(ScrapingJob).count()
    conversations = db.query(AgentConversation).count()
    properties = db.query(Property).count()

    print(f"✅ ScrapingJob table: {scraping_jobs} records")
    print(f"✅ AgentConversation table: {conversations} records")
    print(f"✅ Property table: {properties} records")

print("\n✅ All database tests passed!")
