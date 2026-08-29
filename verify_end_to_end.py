#!/usr/bin/env python3
import requests
import json

files = {
    'resume': ('resume.txt', b'Python SQL API cloud engineering experience', 'text/plain')
}

data = {
    'job_description': 'We are looking for a Python engineer with SQL, APIs, and cloud experience.',
    'required_skills': ['python', 'sql', 'api', 'cloud']
}

try:
    print("Sending multipart POST to /api/screen...")
    r = requests.post('http://localhost:8002/api/screen', files=files, data=data, timeout=30)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print("\n=== SUCCESS ===")
        print(f"Overall Score: {result.get('overall_score')}%")
        print(f"Match Label: {result.get('match_label')}")
        print(f"Matched Skills: {result.get('matched_skills')}")
        print(f"Missing Skills: {result.get('missing_skills')}")
        print("\nFull response:")
        print(json.dumps(result, indent=2))
    else:
        print(f"Error response:\n{r.text}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
