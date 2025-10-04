from .routes import router
from .models import User
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from Database_connection.db import create_tables

__all__ = ["router", "User", "create_tables"]
