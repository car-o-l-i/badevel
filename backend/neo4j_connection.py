from neo4j import GraphDatabase
import os

# Obtener variables de entorno o usar valores predeterminados
URI = os.environ.get("NEO4J_URI", "bolt://neo4j:7687")
USER = os.environ.get("NEO4J_USER", "neo4j")
PASSWORD = os.environ.get("NEO4J_PASSWORD", "Password123")

driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

def close_driver():
    driver.close()
