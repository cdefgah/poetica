import json

import requests

from Base import validate_json, Base, is_json_correct

service_name = "/questions"
action_url = f"{Base.local_server_address}{service_name}"

server_response = requests.get(action_url)
if is_json_correct(server_response.text):
    print("Correct json returned")
    print(server_response.text)
else:
    print("INCORRECT JSON RETURNED")
    print(server_response.text)



