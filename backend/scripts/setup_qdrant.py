"""
T018: Qdrant Collection Setup Script
Creates the recipes collection with proper vector embeddings configuration
"""
import sys
import os

# Add parent directory to path to import config
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from src.config import (
    QDRANT_URL,
    QDRANT_API_KEY,
    QDRANT_COLLECTION_NAME,
    QDRANT_VECTOR_SIZE,
    QDRANT_DISTANCE_METRIC
)

def setup_qdrant_collection():
    """
    Set up Qdrant Cloud collection for recipe embeddings
    Creates collection with proper vector configuration for RAG search
    """
    print(f"🔗 Connecting to Qdrant Cloud at {QDRANT_URL}...")

    try:
        # Initialize Qdrant client
        client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
        )

        # Check if collection already exists
        collections = client.get_collections().collections
        collection_names = [collection.name for collection in collections]

        if QDRANT_COLLECTION_NAME in collection_names:
            print(f"⚠️  Collection '{QDRANT_COLLECTION_NAME}' already exists.")
            print("   To recreate, delete it first from Qdrant Cloud dashboard.")
            return

        # Create collection with vector configuration
        print(f"📦 Creating collection '{QDRANT_COLLECTION_NAME}'...")

        # Map distance metric string to Qdrant Distance enum
        distance_map = {
            "Cosine": Distance.COSINE,
            "Euclidean": Distance.EUCLID,
            "Dot": Distance.DOT
        }

        client.create_collection(
            collection_name=QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(
                size=QDRANT_VECTOR_SIZE,
                distance=distance_map.get(QDRANT_DISTANCE_METRIC, Distance.COSINE)
            )
        )

        print(f"✅ Collection '{QDRANT_COLLECTION_NAME}' created successfully!")
        print(f"   Vector size: {QDRANT_VECTOR_SIZE}")
        print(f"   Distance metric: {QDRANT_DISTANCE_METRIC}")
        print()
        print("🎯 Collection is ready for recipe embeddings.")
        print("   Run generate_embeddings.py to populate with recipe data.")

    except Exception as e:
        print(f"❌ Error setting up Qdrant collection: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    setup_qdrant_collection()
