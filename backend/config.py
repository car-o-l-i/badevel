from config import neo4j_conn
result = neo4j_conn.query("MATCH (n) RETURN count(n) AS total")
for record in result:
    print(record["total"])
