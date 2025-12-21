#!/usr/bin/env python3

import json
import sys
import os
from datetime import datetime

# Python ML step for advanced incident analysis
def analyze_incident(data):
    """Advanced ML analysis using Python"""

    service = data.get('service', 'unknown')
    error = data.get('error', 'unknown')
    severity = data.get('severity', 'low')

    # Simple ML-like logic (in production: use scikit-learn, TensorFlow, etc.)
    risk_score = calculate_risk_score(service, error, severity)
    predicted_resolution_time = estimate_resolution_time(severity, error)
    similar_incidents = find_similar_incidents(service, error)

    analysis = {
        'ml_analysis': True,
        'risk_score': risk_score,
        'predicted_resolution_minutes': predicted_resolution_time,
        'similar_incidents_count': len(similar_incidents),
        'confidence': 0.85,
        'recommendation': 'escalate' if risk_score > 0.8 else 'attempt_remediation',
        'analyzed_at': datetime.now().isoformat()
    }

    return analysis

def calculate_risk_score(service, error, severity):
    """Calculate business impact risk score"""
    score = 0.0

    # Service criticality
    critical_services = ['auth', 'payment', 'database']
    if service in critical_services:
        score += 0.4

    # Error severity
    if 'down' in error.lower() or 'timeout' in error.lower():
        score += 0.3

    # Severity level
    severity_weights = {'critical': 0.3, 'high': 0.2, 'medium': 0.1, 'low': 0.0}
    score += severity_weights.get(severity, 0.0)

    return min(score, 1.0)

def estimate_resolution_time(severity, error):
    """Estimate resolution time in minutes"""
    base_times = {'critical': 30, 'high': 60, 'medium': 120, 'low': 240}
    base_time = base_times.get(severity, 240)

    # Adjust for error complexity
    if 'pool' in error.lower() or 'connection' in error.lower():
        base_time *= 1.5

    return int(base_time)

def find_similar_incidents(service, error):
    """Find similar historical incidents"""
    # In production: query database
    # For demo: return mock similar incidents
    return [
        {'id': 'INC-001', 'similarity': 0.9},
        {'id': 'INC-002', 'similarity': 0.7}
    ]

if __name__ == "__main__":
    # Read input from stdin (passed from Motia)
    input_data = json.load(sys.stdin)

    # Perform ML analysis
    result = analyze_incident(input_data)

    # Output result as JSON
    print(json.dumps(result, indent=2))