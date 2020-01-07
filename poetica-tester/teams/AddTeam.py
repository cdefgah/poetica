import requests

from Base import validate_json, Base

service_name = "/teams"
action_url = f"{Base.local_server_address}{service_name}"

request_parameters = dict(teamNumber='000004',
                          teamTitle='Четвертяшки')

server_response = requests.post(action_url, data=request_parameters)
print(server_response.text)
validate_json(server_response.text)
