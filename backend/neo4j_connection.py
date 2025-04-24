from neo4j import GraphDatabase

# Configura esto con tus datos reales de Neo4j
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "test"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def close_driver():
    driver.close()
