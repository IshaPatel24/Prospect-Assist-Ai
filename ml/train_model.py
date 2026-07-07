"""
Prospect Scoring Model Training Script
Team: Bugspire | IDBI Innovate 2026

This script trains an XGBoost classifier to predict prospect conversion.
For the hackathon prototype, we generate synthetic training data.
In production, replace with real IDBI Bank historical conversion data.
"""
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.preprocessing import LabelEncoder
import json

try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    print("XGBoost not installed. Run: pip install xgboost")
    HAS_XGB = False

np.random.seed(42)
N = 5000

def generate_synthetic_data(n=5000):
    """Generate realistic synthetic prospect data for training."""
    data = pd.DataFrame({
        'age': np.random.randint(22, 65, n),
        'income': np.random.choice([180000,240000,360000,480000,600000,720000,900000,1200000], n),
        'credit_score': np.random.randint(550, 820, n),
        'monthly_txn_count': np.random.randint(3, 40, n),
        'avg_txn_value': np.random.choice([2000,5000,8000,12000,20000,35000], n),
        'bureau_enquiries_6m': np.random.randint(0, 8, n),
        'dpd_history': np.random.choice([0,0,0,0,30,60,90], n),
        'num_existing_products': np.random.randint(1, 5, n),
        'is_salaried': np.random.choice([0,1], n, p=[0.35, 0.65]),
    })

    # Simulate conversion label with realistic correlations
    score = (
        (data['credit_score'] - 550) / 270 * 0.30 +
        (data['income'] / 1200000).clip(0,1) * 0.25 +
        (data['monthly_txn_count'] / 40) * 0.15 +
        (data['is_salaried']) * 0.10 +
        (data['dpd_history'] == 0).astype(int) * 0.10 +
        (data['bureau_enquiries_6m'] <= 2).astype(int) * 0.10
    )
    data['converted'] = (score + np.random.normal(0, 0.1, n) > 0.5).astype(int)
    return data

if __name__ == '__main__' and HAS_XGB:
    print("Generating synthetic training data...")
    df = generate_synthetic_data(N)
    print(f"Dataset: {len(df)} records, {df['converted'].mean():.1%} conversion rate")

    features = ['age','income','credit_score','monthly_txn_count','avg_txn_value',
                'bureau_enquiries_6m','dpd_history','num_existing_products','is_salaried']
    X = df[features]
    y = df['converted']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = xgb.XGBClassifier(
        n_estimators=200, max_depth=6, learning_rate=0.1,
        subsample=0.8, colsample_bytree=0.8,
        use_label_encoder=False, eval_metric='logloss', random_state=42
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=50)

    y_pred_proba = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_pred_proba)
    print(f"\nAUC-ROC Score: {auc:.4f}")
    print(classification_report(y_test, model.predict(X_test)))

    model.save_model('models/prospect_scorer.json')
    print("Model saved to models/prospect_scorer.json")
