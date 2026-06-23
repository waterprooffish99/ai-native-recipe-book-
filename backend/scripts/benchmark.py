"""
Lightweight temporary benchmark script (T111 / Phase 11)
Pings the RAG search endpoint and Chef AI chat endpoint 5 times,
measures average response time (latency), and asserts that Pydantic schemas are intact.
Uses built-in urllib to avoid external dependencies.
"""
import os
import sys
import time
import urllib.request
import urllib.error
import json
from typing import List

# Add parent directory to path to allow importing models
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models.recipe import RecipeSearchResult
from src.models.chef_ai import ChefAIChatResponse

BASE_URL = "http://localhost:8002"

def make_post_request(url, payload=None):
    headers = {"Content-Type": "application/json"}
    data = None
    if payload is not None:
        data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read()
            return response.status, json.loads(res_data.decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 500, str(e)

def benchmark_rag():
    print("🤖 Benchmarking RAG search endpoint...")
    url = f"{BASE_URL}/recipes/search?query=pasta&language=EN"
    latencies = []
    
    for i in range(5):
        start_time = time.perf_counter()
        status_code, data = make_post_request(url)
        end_time = time.perf_counter()
        
        # Verify 200 OK
        assert status_code == 200, f"RAG failed with status {status_code}: {data}"
        
        latency = (end_time - start_time) * 1000  # ms
        latencies.append(latency)
        
        # Validate Pydantic schema
        try:
            if hasattr(RecipeSearchResult, 'model_validate'):
                validated = [RecipeSearchResult.model_validate(item) for item in data]
            else:
                validated = [RecipeSearchResult.parse_obj(item) for item in data]
            assert len(validated) > 0, "Should return at least one search result"
            print(f"  [Run {i+1}] Status: 200 OK | Latency: {latency:.2f} ms | Found: {len(validated)} recipes")
        except Exception as e:
            assert False, f"Pydantic schema validation failed for RecipeSearchResult: {e}"
            
    avg_latency = sum(latencies) / len(latencies)
    print(f"✨ RAG Average Latency: {avg_latency:.2f} ms\n")
    return avg_latency

def benchmark_chef_ai():
    print("🍳 Benchmarking Chef AI Chat endpoint...")
    url = f"{BASE_URL}/chef-ai/chat"
    payload = {
        "message": "Can I substitute olive oil for butter?"
    }
    latencies = []
    
    for i in range(5):
        start_time = time.perf_counter()
        status_code, data = make_post_request(url, payload)
        end_time = time.perf_counter()
        
        # Verify 200 OK
        assert status_code == 200, f"Chef AI failed with status {status_code}: {data}"
        
        latency = (end_time - start_time) * 1000  # ms
        latencies.append(latency)
        
        # Validate Pydantic schema
        try:
            if hasattr(ChefAIChatResponse, 'model_validate'):
                validated = ChefAIChatResponse.model_validate(data)
            else:
                validated = ChefAIChatResponse.parse_obj(data)
            assert validated.is_halal_compliant is True, "Expected Halal compliant to be True"
            print(f"  [Run {i+1}] Status: 200 OK | Latency: {latency:.2f} ms | Reply length: {len(validated.reply)} chars")
        except Exception as e:
            assert False, f"Pydantic schema validation failed for ChefAIChatResponse: {e}"
            
    avg_latency = sum(latencies) / len(latencies)
    print(f"✨ Chef AI Average Latency: {avg_latency:.2f} ms\n")
    return avg_latency

if __name__ == "__main__":
    try:
        rag_avg = benchmark_rag()
        chef_avg = benchmark_chef_ai()
        print("🎉 Benchmark complete! All schemas validated and requests returned 200 OK.")
        print(f"Summary:")
        print(f"  - RAG Search avg latency: {rag_avg:.2f} ms")
        print(f"  - Chef AI Chat avg latency: {chef_avg:.2f} ms")
    except AssertionError as ae:
        print(f"❌ ASSERTION ERROR: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")
        sys.exit(1)
