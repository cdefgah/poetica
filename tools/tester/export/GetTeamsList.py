import requests

from Base import validate_json, Base

service_name = "export/teams"
action_url = f"{Base.local_server_address}{service_name}"

server_response = requests.get(action_url)
print(server_response.text)
validate_json(server_response.text)
