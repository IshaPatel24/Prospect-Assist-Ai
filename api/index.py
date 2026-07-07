import sys
import os

# Add the parent and backend directories to python path so imports in app/main.py resolve correctly
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app
