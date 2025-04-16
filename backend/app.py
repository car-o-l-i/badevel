from flask import Flask, request, jsonify  # type: ignore
from neo4j import GraphDatabase  # type: ignore
import openai  # type: ignore
import os
import csv
import jwt  # type: ignore
import datetime
from werkzeug.security import check_password_hash, generate_password_hash  # type: ignore
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Habilita CORS para todas las rutas

# Configuración de Neo4j
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "Password123"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# Configuración de OpenAI (usa tu API Key)
OPENAI_API_KEY = "TU_API_KEY_AQUI"  # Reemplaza con tu clave de OpenAI
openai.api_key = OPENAI_API_KEY

# Simulación de base de datos para usuarios
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
    query = "MATCH (d:Device) RETURN d.name"
    with driver.session() as session:
        results = session.run(query)
        devices = [record["d.name"] for record in results]
    return jsonify({"devices": devices})

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

# CSV upload (incluye soporte para OPTIONS preflight)
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

if __name__ == '__main__':
    app.run(debug=True)
