import requests

from Base import validate_json, Base

service_name = "actuator/shutdown"
action_url = f"{Base.local_server_address}{service_name}"

print(f"Sending request to the {action_url}")

server_response = requests.post(action_url)
print(server_response.text)
validate_json(server_response.text)