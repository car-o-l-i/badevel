from flask import Flask, request, jsonify  # type: ignore
from neo4j import GraphDatabase  # type: ignore
import openai  # type: ignore
import os
import csv
import jwt  # type: ignore
import datetime
import requests  # para importar CSV
import io  # para procesar texto de CSV
from werkzeug.security import check_password_hash, generate_password_hash  # type: ignore
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://frontend:5173", "http://frontend_badevel:5173", "*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuración de Neo4j desde variables de entorno
NEO4J_URI = os.environ.get("NEO4J_URI", "bolt://neo4j:7687")
NEO4J_USER = os.environ.get("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD", "Password123")

print(f"Connecting to Neo4j at {NEO4J_URI} with user {NEO4J_USER}")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# OpenAI
OPENAI_API_KEY = "TU_API_KEY_AQUI"
openai.api_key = OPENAI_API_KEY

# Usuarios simulados
users_db = {
    "admin": {
        "password": generate_password_hash("admin_password"),
        "role": "admin"
    },
    "user": {
        "password": generate_password_hash("user_password"),
        "role": "user"
    }
}

SECRET_KEY = "mi_clave_secreta"

@app.route('/')
def home():
    return jsonify({"message": "Flask is connected to Neo4j and OpenAI!"})


# CRUD para dispositivos
@app.route("/devices", methods=["POST"])
def create_device():
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"error": "Missing device name"}), 400

    query = "CREATE (d:Device {name: $name}) RETURN d.name"
    with driver.session() as session:
        result = session.run(query, name=name)
        device_name = result.single()

    if device_name:
        return jsonify({"message": f"Device '{device_name[0]}' created successfully!"})
    else:
        return jsonify({"error": "Device could not be created"}), 500

@app.route("/devices", methods=["GET"])
def get_devices():
    try:
        query = "MATCH (d:Device) RETURN d.name"
        with driver.session() as session:
            results = session.run(query)
            devices = [record["d.name"] for record in results]
        return jsonify({"devices": devices})
    except Exception as e:
        print(f"Error in get_devices: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Error details: {e.__dict__}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route("/devices/<name>", methods=["PUT"])
def update_device(name):
    data = request.json
    new_name = data.get("new_name")
    if not new_name:
        return jsonify({"error": "Missing new name"}), 400

    query = "MATCH (d:Device {name: $name}) SET d.name = $new_name RETURN d.name"
    with driver.session() as session:
        result = session.run(query, name=name, new_name=new_name)
        updated_name = result.single()

    if updated_name:
        return jsonify({"message": f"Device updated to '{updated_name[0]}'"})
    else:
        return jsonify({"error": "Device not found"}), 404

@app.route("/devices/<name>", methods=["DELETE"])
def delete_device(name):
    query = "MATCH (d:Device {name: $name}) DELETE d RETURN d"
    with driver.session() as session:
        result = session.run(query, name=name)
        deleted_device = result.single()

    if deleted_device:
        return jsonify({"message": f"Device '{name}' deleted successfully!"})
    else:
        return jsonify({"error": "Device not found"}), 404


# Preguntas a OpenAI
@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    question = data.get("question")
    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a Neo4j Cypher query generator."},
                {"role": "user", "content": f"Convert this question into a Cypher query: {question}"}
            ]
        )
        cypher_query = response["choices"][0]["message"]["content"]
        with driver.session() as session:
            result = session.run(cypher_query)
            data = [record.data() for record in result]

        return jsonify({"cypher_query": cypher_query, "result": data})

    except Exception as e:
        return jsonify({"error": f"Failed to process request: {str(e)}"}), 500


# Subida manual de CSV desde frontend
@app.route("/upload-csv", methods=["POST", "OPTIONS"])
def upload_csv():
    if request.method == "OPTIONS":
        return '', 200

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    devices_added = []
    stream = file.stream.read().decode("utf-8").splitlines()
    csv_reader = csv.DictReader(stream)
    with driver.session() as session:
        for row in csv_reader:
            name = row.get("name")
            if not name:
                continue
            query = "CREATE (d:Device {name: $name}) RETURN d.name"
            result = session.run(query, name=name)
            device_name = result.single()
            if device_name:
                devices_added.append(device_name[0])
    return jsonify({"message": "Devices added successfully!", "devices": devices_added})


# Login
@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username")
    password = request.json.get("password")
    user = users_db.get(username)
    if user and check_password_hash(user["password"], password):
        payload = {
            "username": username,
            "role": user["role"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        return jsonify({"success": True, "token": token, "role": user["role"]})
    else:
        return jsonify({"success": False, "message": "Credenciales incorrectas"}), 401


# Importar THINGS desde CSV
@app.route("/import-things", methods=["GET", "POST"])
def import_things():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/things.csv"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching CSV: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            query = """
            MERGE (t:Thing {id: $id})
            SET t.name = $name,
                t.lat = toFloat($lat),
                t.lon = toFloat($lon),
                t.latest_value = $latest_value
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"],
                "lat": row["lat"],
                "lon": row["lon"],
                "latest_value": row.get("latest_value", "")
            })
            created += 1

    return jsonify({"status": "ok", "imported": created})


# Importar SENSORS desde CSV
@app.route("/import-sensors", methods=["GET", "POST"])
def import_sensors():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/sensors.csv"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
        print(f"CSV data loaded: {len(csv_data)} lines")
        
        # Afficher l'en-tête et les premières lignes pour déboguer
        for i, line in enumerate(csv_data[:3]):
            print(f"Line {i}: {line}")
    except Exception as e:
        return jsonify({"error": f"Error fetching sensors.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    print("Creating/updating Sensor nodes...")
    with driver.session() as session:
        for row in reader:
            print(f"Processing sensor: {row}")
            query = """
            MERGE (s:Sensor {id: $id})
            SET s.name = $name,
                s.entType = $entType,
                s.unit = $unit,
                s.description = $description
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"],
                "entType": row.get("entType", ""),
                "unit": row.get("unit", ""),
                "description": row.get("description", "")
            })
            created += 1
            
    print(f"Successfully created/updated {created} Sensor nodes")
    # Vérifier que les nœuds sont bien créés en exécutant une requête de comptage
    with driver.session() as session:
        result = session.run("MATCH (s:Sensor) RETURN count(s) as count")
        count = result.single()["count"]
        print(f"Total Sensor nodes in database: {count}")
    
    return jsonify({"status": "ok", "imported": created, "total_nodes": count})

# Importar POWER desde CSV
@app.route("/import-power", methods=["GET", "POST"])
def import_power():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/power.csv"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching power.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            query = """
            MERGE (p:Power {id: $id})
            SET p.name = $name
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"]
            })
            created += 1

    return jsonify({"status": "ok", "imported": created})

@app.route("/import-network", methods=["GET", "POST"])
def import_network():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/network.csv"

    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching network.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            query = """
            MERGE (n:Network {id: $id})
            SET n.name = $name
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"]
            })
            created += 1

    return jsonify({"status": "ok", "imported": created})

@app.route("/import-thingtype", methods=["GET", "POST"])
def import_thingtype():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/thingtype.csv"

    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching thingtype.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            query = """
            MERGE (t:ThingType {id: $id})
            SET t.name = $name
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"]
            })
            created += 1

    return jsonify({"status": "ok", "imported": created})

###
@app.route("/import-module", methods=["GET", "POST"])
def import_module():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/module.csv"

    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching module.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            query = """
            MERGE (m:Module {id: $id})
            SET m.name = $name
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"]
            })
            created += 1

    return jsonify({"status": "ok", "imported": created})
##
@app.route("/import-vendor", methods=["GET", "POST"])
def import_vendor():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/vendors.csv"

    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching vendors.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            query = """
            MERGE (v:Vendor {id: $id})
            SET v.name = $name,
                v.entType = $entType
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"],
                "entType": row["entType"]
            })
            created += 1

    return jsonify({"status": "ok", "imported": created})
##
@app.route("/import-manufacturer", methods=["GET", "POST"])
def import_manufacturer():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/manufacturers.csv"

    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching manufacturers.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            query = """
            MERGE (m:Manufacturer {id: $id})
            SET m.name = $name
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"]
            })
            created += 1

    return jsonify({"status": "ok", "imported": created})
##
@app.route("/import-location", methods=["GET", "POST"])
def import_location():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/locations.csv"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching locations.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            query = """
            MERGE (l:Location {id: $id})
            SET l.name = $name
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"]
            })
            created += 1

    return jsonify({"status": "ok", "imported": created})
##
@app.route("/import-department", methods=["GET", "POST"])
def import_department():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/departments.csv"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching departments.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            # Solo procesar filas válidas
            if not row.get("identifier") or not row.get("name"):
                continue

            query = """
            MERGE (d:Department {id: $id})
            SET d.name = $name
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"]
            })
            created += 1

    return jsonify({"status": "ok", "imported": created})
##
@app.route("/import-application", methods=["GET", "POST"])
def import_application():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/applications.csv"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching applications.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            # Solo procesar filas válidas
            if not row.get("identifier") or not row.get("name"):
                continue

            query = """
            MERGE (a:Application {id: $id})
            SET a.name = $name
            """
            session.run(query, {
                "id": row["identifier"],
                "name": row["name"]
            })
            created += 1

    return jsonify({"status": "ok", "imported": created})
##
@app.route("/import-relationships", methods=["GET", "POST"])
def import_relationships():
    url = "https://raw.githubusercontent.com/josephazar/graph_of_things/main/Neo4jThings/relation.csv"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        csv_data = response.content.decode("utf-8").splitlines()
    except Exception as e:
        return jsonify({"error": f"Error fetching relation.csv: {str(e)}"}), 500

    reader = csv.DictReader(io.StringIO("\n".join(csv_data)))
    created = 0

    with driver.session() as session:
        for row in reader:
            try:
                source = row["thingId"]
                target = row["entityid"]
                rel_type = row["relationshipname"]
                properties = row.get("prop", "{}")

                query = """
                MATCH (a {id: $source}), (b {id: $target})
                CALL apoc.create.relationship(a, $rel_type, apoc.convert.fromJsonMap($props), b)
                YIELD rel
                RETURN rel
                """
                session.run(query, {
                    "source": source,
                    "target": target,
                    "rel_type": rel_type,
                    "props": properties
                })
                created += 1
            except Exception as e:
                print(f"Error with relationship {row}: {str(e)}")

    return jsonify({"status": "ok", "imported": created})

@app.route("/graph-data", methods=["GET"])
def graph_data():
    query = """
    MATCH (n)-[r]->(m)
    RETURN n, r, m
    """

    nodes = {}
    links = []

    try:
        with driver.session() as session:
            results = session.run(query)
            for record in results:
                source = record["n"]
                target = record["m"]
                relation = record["r"]

                # Agregar nodos únicos
                for node in [source, target]:
                    node_id = node["id"]
                    if node_id not in nodes:
                        nodes[node_id] = {
                            "id": node_id,
                            "label": list(node.labels)[0],
                            "name": node.get("name", "")
                        }

                # Agregar relación
                links.append({
                    "source": source["id"],
                    "target": target["id"],
                    "type": relation.type
                })

    except Exception as e:
        print(f"Error in graph_data: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Error details: {e.__dict__}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    return jsonify({
        "nodes": list(nodes.values()),
        "links": links
    })

# Endpoint para crear nodos de diferentes tipos
@app.route("/create-node", methods=["POST"])
def create_node():
    data = request.json
    node_type = data.get("type")
    name = data.get("name")
    properties = data.get("properties", {})
    
    if not node_type or not name:
        return jsonify({"error": "Missing node type or name"}), 400
    
    # Propiedades básicas para todos los nodos
    node_props = {
        "name": name,
        "id": f"{node_type.lower()}_{name.lower().replace(' ', '_')}_{int(datetime.datetime.now().timestamp())}"
    }
    
    # Añadir propiedades adicionales
    node_props.update(properties)
    
    # Construir query para crear el nodo con el tipo especificado
    query = f"CREATE (n:{node_type} $props) RETURN n.id as id, n.name as name"
    
    try:
        with driver.session() as session:
            result = session.run(query, props=node_props)
            created_node = result.single()
            
            if created_node:
                return jsonify({
                    "success": True,
                    "node": {
                        "id": created_node["id"],
                        "name": created_node["name"],
                        "type": node_type
                    }
                })
            else:
                return jsonify({"error": "Node could not be created"}), 500
    except Exception as e:
        print(f"Error creating node: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# Endpoint para crear relaciones entre nodos
@app.route("/create-relationship", methods=["POST"])
def create_relationship():
    data = request.json
    source_id = data.get("source_id")
    target_id = data.get("target_id")
    rel_type = data.get("rel_type")
    properties = data.get("properties", {})
    
    if not source_id or not target_id or not rel_type:
        return jsonify({"error": "Missing source, target or relationship type"}), 400
    
    # Query para crear la relación
    query = """
    MATCH (a), (b)
    WHERE a.id = $source_id AND b.id = $target_id
    CREATE (a)-[r:$rel_type $props]->(b)
    RETURN a.id as source, b.id as target, type(r) as type
    """
    
    try:
        with driver.session() as session:
            result = session.run(query, 
                                source_id=source_id, 
                                target_id=target_id, 
                                rel_type=rel_type, 
                                props=properties)
            created_rel = result.single()
            
            if created_rel:
                return jsonify({
                    "success": True,
                    "relationship": {
                        "source": created_rel["source"],
                        "target": created_rel["target"],
                        "type": created_rel["type"]
                    }
                })
            else:
                return jsonify({"error": "Relationship could not be created"}), 500
    except Exception as e:
        print(f"Error creating relationship: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# Endpoint para obtener todos los nodos de un tipo específico
@app.route("/nodes/<node_type>", methods=["GET"])
def get_nodes_by_type(node_type):
    try:
        # Handle variations in node type casing (Sensor vs sensor vs SENSOR)
        # Convert first letter to uppercase and the rest to lowercase for the query
        formatted_node_type = node_type.capitalize()
        
        # For plural forms, remove trailing 's' and capitalize
        if formatted_node_type.endswith('s'):
            singular_type = formatted_node_type[:-1] 
            query = f"""
            MATCH (n) 
            WHERE n:{formatted_node_type} OR n:{singular_type}
            RETURN n
            """
        else:
            query = f"MATCH (n:{formatted_node_type}) RETURN n"

        print(f"Executing Neo4j query: {query}")
        
        with driver.session() as session:
            results = session.run(query)
            nodes = []
            for record in results:
                node = record["n"]
                node_data = dict(node.items())  # Convertir toutes les propriétés en dictionnaire
                # Assurer que id et name existent
                if "id" not in node_data and node.id is not None:
                    node_data["id"] = node.id
                if "name" not in node_data and "name" in node.keys():
                    node_data["name"] = node["name"]
                nodes.append(node_data)
            
            print(f"Found {len(nodes)} nodes of type {node_type}")
            print(f"Node data: {nodes}")
            
        return jsonify({"nodes": nodes})
    except Exception as e:
        print(f"Error getting nodes: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# Ejecutar
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)













