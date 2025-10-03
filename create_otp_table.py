"""
Create OTP Verifications Table in Neon Database
Run this script once to create the table: python create_otp_table.py
"""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv('backend/.env')

DB_URL = os.getenv('DB_URL')

# SQL to create table
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS otp_verifications (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(15) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_created ON otp_verifications(created_at);
CREATE INDEX IF NOT EXISTS idx_otp_used ON otp_verifications(is_used);
"""

def create_otp_table():
    try:
        # Connect to database
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()
        
        # Create table
        cursor.execute(CREATE_TABLE_SQL)
        conn.commit()
        
        print("✅ OTP table created successfully!")
        
        # Verify table exists
        cursor.execute("SELECT COUNT(*) FROM otp_verifications;")
        print(f"✅ Table verified. Current OTP count: {cursor.fetchone()[0]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")

if __name__ == "__main__":
    print("Creating OTP verifications table...")
    create_otp_table()
