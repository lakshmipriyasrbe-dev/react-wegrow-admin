import sys
import os
from datetime import datetime

try:
    import pymysql
    import psycopg2
    from psycopg2.extras import execute_values
    from dotenv import load_dotenv
    load_dotenv()
except ImportError as e:
    print("============================================================")
    print("MIGRATION SCRIPT NOTICE:")
    print(f"Missing dependency: {e.name}")
    print("Please install the database drivers before running data migration:")
    print("  pip install pymysql psycopg2-binary python-dotenv")
    print("============================================================")
    sys.exit(0)

# MySQL source config (Default local XAMPP)
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASS = os.getenv("MYSQL_PASS", "")
MYSQL_DB = os.getenv("MYSQL_DB", "training_center_db")

# PostgreSQL target config
PG_HOST = os.getenv("POSTGRES_SERVER", "localhost")
PG_PORT = os.getenv("POSTGRES_PORT", "5432")
PG_USER = os.getenv("POSTGRES_USER", "postgres")
PG_PASS = os.getenv("POSTGRES_PASSWORD", "postgres")
PG_DB = os.getenv("POSTGRES_DB", "wegrow_erp_db")

TABLES_ORDER = [
    "tc_roles",
    "tc_role_permissions",
    "tc_company",
    "tc_users",
    "tc_staff",
    "tc_course",
    "tc_payment_mode",
    "tc_bank",
    "tc_expense_category",
    "tc_event_category",
    "tc_enrollment",
    "tc_enrollment_internship",
    "tc_payment",
    "tc_installments",
    "tc_attendance",
    "tc_student_attendance",
    "tc_staff_leave_requests",
    "tc_payroll",
    "tc_expense_entry",
    "tc_course_enquiry",
    "tc_enquiry_followup",
    "tc_tasks",
    "tc_student_tasks",
    "tc_student_feedback",
    "tc_questions",
    "tc_question_sets",
    "tc_event",
    "tc_offer",
    "tc_pamphlet_registration",
    "tc_audit_logs",
    "tc_logins"
]

def run_migration():
    print("============================================================")
    print("WEGROW ERP - MYSQL TO POSTGRESQL AUTOMATED DATA MIGRATION")
    print("============================================================")
    print(f"Connecting to MySQL: {MYSQL_HOST} -> DB: {MYSQL_DB}")
    try:
        mysql_conn = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASS,
            database=MYSQL_DB,
            cursorclass=pymysql.cursors.DictCursor
        )
        print(" Connected to MySQL successfully.")
    except Exception as e:
        print(f" MySQL Connection Failed: {e}")
        print("Please verify your MySQL service is running.")
        return

    print(f"Connecting to PostgreSQL: {PG_HOST}:{PG_PORT} -> DB: {PG_DB}")
    try:
        pg_conn = psycopg2.connect(
            host=PG_HOST,
            port=PG_PORT,
            user=PG_USER,
            password=PG_PASS,
            dbname=PG_DB
        )
        pg_conn.autocommit = False
        print(" Connected to PostgreSQL successfully.")
    except Exception as e:
        print(f" PostgreSQL Connection Failed: {e}")
        print("Please ensure PostgreSQL is installed and database created.")
        return

    total_tables = len(TABLES_ORDER)
    migrated_tables = 0
    total_records = 0

    with mysql_conn.cursor() as m_cursor, pg_conn.cursor() as p_cursor:
        for tbl in TABLES_ORDER:
            try:
                # Check if table exists in MySQL
                m_cursor.execute(f"SHOW TABLES LIKE '{tbl}'")
                if not m_cursor.fetchone():
                    print(f"[-] Skipping {tbl} (not found in MySQL)")
                    continue

                m_cursor.execute(f"SELECT * FROM `{tbl}`")
                rows = m_cursor.fetchall()
                count = len(rows)

                if count == 0:
                    print(f"[✓] Table '{tbl}': 0 records (empty)")
                    continue

                # Get column names
                columns = list(rows[0].keys())
                col_names_quoted = ['"' + c + '"' for c in columns]
                col_str = ", ".join(col_names_quoted)
                placeholders = ", ".join(["%s"] * len(columns))

                # Clear target table in PG
                p_cursor.execute(f'TRUNCATE TABLE "{tbl}" RESTART IDENTITY CASCADE;')

                # Insert records
                values = [tuple(r[c] for c in columns) for r in rows]
                insert_query = f'INSERT INTO "{tbl}" ({col_str}) VALUES ({placeholders})'
                
                for val in values:
                    p_cursor.execute(insert_query, val)

                # Reset sequence for primary key
                seq_query = f"""SELECT setval(pg_get_serial_sequence('"{tbl}"', 'id'), coalesce(max(id), 1)) FROM "{tbl}";"""
                p_cursor.execute(seq_query)

                pg_conn.commit()
                print(f"[✓] Table '{tbl}': Migrated {count} records successfully.")
                migrated_tables += 1
                total_records += count

            except Exception as ex:
                pg_conn.rollback()
                print(f"[!] Error migrating table '{tbl}': {ex}")

    mysql_conn.close()
    pg_conn.close()
    print("============================================================")
    print(f"MIGRATION SUMMARY: {migrated_tables} tables, {total_records} total records transferred.")
    print("============================================================")

if __name__ == "__main__":
    run_migration()
