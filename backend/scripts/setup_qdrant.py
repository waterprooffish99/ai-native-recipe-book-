import sys
import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.config import (
    QDRANT_URL,
    QDRANT_API_KEY,
    QDRANT_COLLECTION_NAME,
    QDRANT_VECTOR_SIZE,
    QDRANT_DISTANCE_METRIC
)

def setup_qdrant_collection():
    # CLEAN THE URL: Remove any trailing slashes or hidden whitespace
    clean_url = QDRANT_URL.strip().rstrip('/')
    
    print(f"🔗 Attempting Cloud Connection: {clean_url}")

    try:
        # For Qdrant Cloud, we use the url parameter directly.
        # Cloud uses port 443 (default HTTPS), NOT 6333.
        client = QdrantClient(
            url=clean_url,
            api_key=QDRANT_API_KEY,
            prefer_grpc=False # Set to False for easier connection through firewalls/WSL
        )

        # Verify connection by getting collections
        print("📡 Pinging Qdrant Cloud...")
        client.get_collections()
        print("✅ Connection Successful!")

        # Rest of your creation logic...
        client.recreate_collection(
            collection_name=QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(
                size=QDRANT_VECTOR_SIZE,
                distance=Distance.COSINE
            )
        )
        print(f"🚀 Collection '{QDRANT_COLLECTION_NAME}' is ready!")

    except Exception as e:
        print(f"❌ Connection Failed: {str(e)}")
        if "404" in str(e):
            print("\n💡 Haadi's Tip: Double check your Cluster URL in the Qdrant Dashboard.")
            print("   It should look like 'https://xxx-xxx.us-east4-0.gcp.cloud.qdrant.io'")
        sys.exit(1)

if __name__ == "__main__":
    setup_qdrant_collection()