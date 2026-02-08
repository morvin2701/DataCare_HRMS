import sqlite3

def migrate_password():
    print("Migrating database for password...")
    try:
        conn = sqlite3.connect("sql_app.db")
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "password" not in columns:
            print("Adding 'password' column to 'users' table...")
            # Default password for existing users is '123456'
            cursor.execute("ALTER TABLE users ADD COLUMN password VARCHAR DEFAULT '123456'")
            conn.commit()
            print("Migration successful: Added 'password' column.")
        else:
            print("Column 'password' already exists. Skipping.")
            
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate_password()
