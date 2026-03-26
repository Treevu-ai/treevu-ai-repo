#!/usr/bin/env python3
"""
Treevú ML Integration Service
Demonstrates how to integrate the ML models from the Jupyter notebook
with the production application via FastAPI.

This script shows the architecture for model deployment.
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import random

class TreevuMLService:
    """Mock ML Service - demonstrates how Jupyter models would be deployed"""
    
    def __init__(self):
        """Initialize ML models (in production, load trained sklearn/XGBoost models)"""
        self.models = {
            'ewa_demand_regression': None,  # R² = 0.95
            'ewa_classification': None,      # AUC-ROC = 1.00
            'clustering': None,              # 4 clusters
        }
    
    def predict_wellness_score(
        self,
        monthly_salary: float,
        total_ewa_withdrawn: float,
        ewa_usage_count: int,
        days_since_last_ewa: Optional[int] = None,
    ) -> Dict:
        """
        Predict financial wellness score (0-100)
        
        Based on:
        - Salary level
        - EWA withdrawal patterns
        - Frequency of usage
        - Time since last withdrawal
        """
        # Mock prediction logic (based on Jupyter notebook models)
        base_score = 50
        
        # Salary component (higher salary = higher wellness, up to 70 points)
        salary_component = min((monthly_salary / 10000) * 20, 20)
        
        # Withdrawal pattern component
        withdrawal_ratio = total_ewa_withdrawn / monthly_salary if monthly_salary > 0 else 0
        withdrawal_component = max(-30, -30 * withdrawal_ratio)
        
        # Usage frequency component
        usage_component = max(-15, -5 * ewa_usage_count)
        
        # Time since last withdrawal bonus
        recency_component = 0
        if days_since_last_ewa:
            recency_component = min(15, (days_since_last_ewa / 30) * 15)
        
        predicted_score = int(
            base_score + salary_component + withdrawal_component + usage_component + recency_component
        )
        
        return {
            'predicted_score': max(0, min(100, predicted_score)),
            'confidence': 0.85,
            'trend': 'up' if salary_component > withdrawal_component else 'down',
            'components': {
                'salary': salary_component,
                'withdrawals': withdrawal_component,
                'usage': usage_component,
                'recency': recency_component,
            }
        }
    
    def predict_ewa_demand(
        self,
        monthly_salary: float,
        avg_request_amount: float,
        request_frequency: int,
        days_since_signup: int,
    ) -> Dict:
        """
        Predict probability and timing of next EWA request
        
        Returns:
        - Probability (0-100) of requesting EWA in next 7-30 days
        - Predicted amount
        - Likely date range
        """
        # Mock prediction logic
        base_probability = 30
        
        # Frequency component
        frequency_component = min(40, request_frequency * 5)
        
        # Amount component (larger requests indicate higher need)
        amount_ratio = avg_request_amount / monthly_salary if monthly_salary > 0 else 0
        amount_component = min(30, amount_ratio * 50)
        
        probability = int(min(100, base_probability + frequency_component + amount_component))
        
        # Estimate likely request amount
        if avg_request_amount > 0:
            likely_amount = int(avg_request_amount * random.uniform(0.8, 1.2))
        else:
            likely_amount = int(monthly_salary * 0.3)
        
        return {
            'probability': probability,
            'likely_amount': likely_amount,
            'predicted_next_request': '7-14 days' if probability > 60 else '15-30 days',
            'confidence': 0.78,
            'risk_level': 'high' if probability > 70 else 'medium' if probability > 40 else 'low',
        }
    
    def predict_company_demand(
        self,
        total_employees: int,
        avg_monthly_payroll: float,
        recent_requests: List[float],
        request_dates: List[str],
    ) -> Dict:
        """
        Predict aggregate EWA demand for a company
        
        Returns 30-day forecast with daily predictions
        """
        total_requested = sum(recent_requests) if recent_requests else 0
        avg_request = total_requested / len(recent_requests) if recent_requests else 0
        
        # Calculate trend
        if len(recent_requests) > 1:
            recent_avg = sum(recent_requests[-5:]) / min(5, len(recent_requests))
            older_avg = sum(recent_requests[:-5]) / max(1, len(recent_requests) - 5)
            trend = (recent_avg - older_avg) / max(older_avg, 1)
        else:
            trend = 0
        
        # Forecast next 30 days
        forecast = []
        for day in [7, 14, 21, 30]:
            predicted = int(len(recent_requests) * 1.2 * (1 + trend * (day / 30)))
            forecast.append({
                'day': day,
                'predicted_requests': predicted,
                'predicted_total': int(predicted * avg_request),
            })
        
        return {
            'forecast_30_days': forecast,
            'recent_request_count': len(recent_requests),
            'avg_request_amount': int(avg_request),
            'total_predicted_demand': int(sum(f['predicted_total'] for f in forecast)),
            'trend': 'increasing' if trend > 0.1 else 'decreasing' if trend < -0.1 else 'stable',
        }
    
    def segment_employees(
        self,
        employees: List[Dict],
    ) -> Dict:
        """
        Segment employees into 4 clusters based on financial wellness
        
        Clusters:
        1. Healthy - High wellness score, low EWA usage
        2. At Risk - Declining wellness, moderate usage
        3. Frequent Users - Regular EWA requests
        4. Critical - Very low wellness, high dependency
        """
        if not employees:
            return {'segments': {}}
        
        # Score each employee
        scores = []
        for emp in employees:
            wellness = emp.get('financial_wellness_score', 50)
            usage = emp.get('ewa_usage_count', 0)
            withdrew = emp.get('total_ewa_withdrawn', 0)
            salary = emp.get('monthly_salary', 0)
            
            # Composite score
            composite = wellness - (usage * 10) - (withdrew / salary * 100) if salary > 0 else 0
            scores.append((emp['id'], composite, wellness))
        
        # Simple clustering (k-means equivalent)
        scores.sort(key=lambda x: x[1], reverse=True)
        segment_size = max(1, len(scores) // 4)
        
        segments = {
            'healthy': [s[0] for s in scores[:segment_size]],
            'at_risk': [s[0] for s in scores[segment_size:segment_size*2]],
            'frequent_users': [s[0] for s in scores[segment_size*2:segment_size*3]],
            'critical': [s[0] for s in scores[segment_size*3:]],
        }
        
        return {
            'segments': segments,
            'segment_sizes': {k: len(v) for k, v in segments.items()},
            'recommendations': {
                'healthy': 'Continue monitoring',
                'at_risk': 'Offer financial education',
                'frequent_users': 'Encourage emergency fund building',
                'critical': 'Immediate intervention recommended',
            }
        }


def main():
    """Demonstrate ML service capabilities"""
    print("=" * 60)
    print("Treevú ML Service Demo")
    print("=" * 60)
    
    ml = TreevuMLService()
    
    # Example 1: Wellness Score Prediction
    print("\n1. WELLNESS SCORE PREDICTION")
    print("-" * 60)
    wellness = ml.predict_wellness_score(
        monthly_salary=3000,
        total_ewa_withdrawn=1200,
        ewa_usage_count=3,
        days_since_last_ewa=15,
    )
    print(json.dumps(wellness, indent=2))
    
    # Example 2: EWA Demand Prediction
    print("\n2. EWA DEMAND PREDICTION")
    print("-" * 60)
    demand = ml.predict_ewa_demand(
        monthly_salary=3000,
        avg_request_amount=500,
        request_frequency=3,
        days_since_signup=90,
    )
    print(json.dumps(demand, indent=2))
    
    # Example 3: Company Demand Forecast
    print("\n3. COMPANY DEMAND FORECAST (30 days)")
    print("-" * 60)
    company_demand = ml.predict_company_demand(
        total_employees=100,
        avg_monthly_payroll=300000,
        recent_requests=[500, 600, 550, 700, 800, 650, 700],
        request_dates=['2024-01-01', '2024-01-03', '2024-01-05'],
    )
    print(json.dumps(company_demand, indent=2))
    
    # Example 4: Employee Segmentation
    print("\n4. EMPLOYEE SEGMENTATION")
    print("-" * 60)
    employees = [
        {
            'id': 'emp1',
            'monthly_salary': 3000,
            'financial_wellness_score': 85,
            'ewa_usage_count': 0,
            'total_ewa_withdrawn': 0,
        },
        {
            'id': 'emp2',
            'monthly_salary': 3000,
            'financial_wellness_score': 45,
            'ewa_usage_count': 5,
            'total_ewa_withdrawn': 2000,
        },
        {
            'id': 'emp3',
            'monthly_salary': 3000,
            'financial_wellness_score': 30,
            'ewa_usage_count': 8,
            'total_ewa_withdrawn': 3000,
        },
    ]
    
    segments = ml.segment_employees(employees)
    print(json.dumps(segments, indent=2))
    
    print("\n" + "=" * 60)
    print("In production, these functions would:")
    print("1. Load pre-trained sklearn/XGBoost models")
    print("2. Run through FastAPI endpoints")
    print("3. Be called by the Node.js backend")
    print("4. Update predictions in real-time")
    print("=" * 60)


if __name__ == '__main__':
    main()
