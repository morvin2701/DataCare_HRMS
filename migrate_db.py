import sqlite3

def migrate():
    print("Migrating database...")
    try:
        conn = sqlite3.connect("sql_app.db")
        cursor = conn.cursor()
        
        # Check if column exists to avoid error
        cursor.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "department" not in columns:
            print("Adding 'department' column to 'users' table...")
            cursor.execute("ALTER TABLE users ADD COLUMN department VARCHAR DEFAULT 'General'")
            conn.commit()
            print("Migration successful: Added 'department' column.")
        else:
            print("Column 'department' already exists. Skipping.")
            
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
