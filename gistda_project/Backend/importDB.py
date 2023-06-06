from dotenv import dotenv_values
import psycopg2

secrets = dotenv_values(".env")
dbname = secrets["DB_NAME"]
user = secrets["DB_USER"]
password = secrets["DB_PASSWORD"]

# Connect to an existing database
conn = psycopg2.connect(f"dbname={dbname} user={user} password={password}")

# Open a cursor to perform database operations
cur = conn.cursor()

# cur.execute("SELECT * FROM public.rice_20230315 LIMIT 1")
# rows = cur.fetchall()
# for row in rows:
#     print(row)

with open("hotspot/hotspot_2023-03.csv", encoding="utf8") as f:
    table_name = "hotspot_202305"
    cur.execute(
        f"""
        CREATE TABLE {table_name} (
        OBJECTID INT,
        LATITUDE DECIMAL(14, 11),
        LONGITUDE DECIMAL(14, 11),
        BRIGHTNESS DECIMAL(18, 11),
        SCAN DECIMAL(18, 11),
        TRACK DECIMAL(18, 11),
        ACQ_DATE DATE,
        ACQ_TIME INT,
        SATELLITE CHAR(1),
        CONFIDENCE INT,
        VERSION VARCHAR(7),
        BRIGHT_T31 DECIMAL(18, 11),
        FRP DECIMAL(18, 11),
        th_date DATE,
        th_time INT,
        CHANGWAT VARCHAR(10),
        AMPHOE VARCHAR(30),
        TAMBOL VARCHAR(30),
        Name_1 VARCHAR(50),
        MOO_1 VARCHAR(50),
        TAMBON_T VARCHAR(30),
        AMPHOE_T VARCHAR(50),
        PROVINCE_T VARCHAR(50),
        HotSpotID VARCHAR(20),
        LU_CODE INT,
        LU_NAME VARCHAR(50),
        LU_HP VARCHAR(10),
        LU_HP_Name VARCHAR(50),
        INSTRUMENT VARCHAR(10),
        F_ALARM INT,
        TB_IDN INT,
        TB_CODE VARCHAR(4),
        TB_TN VARCHAR(30),
        TB_EN VARCHAR(50),
        AP_IDN INT,
        AP_TN VARCHAR(30),
        AP_EN VARCHAR(50),
        PV_IDN INT,
        PV_CODE VARCHAR(2),
        PV_TN VARCHAR(30),
        PV_EN VARCHAR(50),
        RE_NESDB VARCHAR(2),
        RE_ROYIN VARCHAR(2),
        AP_CODE INT,
        CT_TN VARCHAR(50),
        CT_EN VARCHAR(50),
        UTM_Zone INT,
        UTM_E DECIMAL(18, 11),
        UTM_N DECIMAL(18, 11),
        village VARCHAR(30),
        v_dist DECIMAL(14, 11),
        v_angle DECIMAL(14, 11),
        v_direct CHAR(1),
        linkGMap VARCHAR(100)
        );
    """)

# Make the changes to the database persistent
conn.commit()

# Close communication with the database
cur.close()
conn.close()
