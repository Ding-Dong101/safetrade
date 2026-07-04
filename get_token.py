import requests
import json

url = "http://localhost:8080/api/auth/login"
payload = {
    "username": "admin",
    "password": "admin123"
}

try:
    response = requests.post(url, json=payload, timeout=5)
    if response.status_code == 200:
        data = response.json()
        token = data.get('token', '')
        print("Bearer Token Generated Successfully!")
        print("=" * 70)
        print(f"\nAuthorization Header:")
        print(f"Authorization: Bearer {token}")
        print(f"\n\nFull Token (without 'Bearer' prefix):")
        print(token)
        print(f"\n\nUser Information:")
        print(f"Username: {data['user']['username']}")
        print(f"Email: {data['user']['email']}")
        print(f"Balance: {data['user']['balance']}")
        print(f"User ID: {data['userId']}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Connection Error: {e}")
    print("Make sure the backend is running on http://localhost:8080")
