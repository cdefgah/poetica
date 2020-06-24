import requests

from Base import validate_json, Base

service_name = "/questions"
teamId = 1
action_url = f"{Base.local_server_address}{service_name}/{teamId}"

server_response = requests.delete(action_url)
print(f"returned status code: {server_response.status_code}")
print(server_response.text)
validate_json(server_response.text)
