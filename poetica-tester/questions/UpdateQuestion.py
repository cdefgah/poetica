import requests

from Base import validate_json, Base

service_name = "/questions"
questionId=1
action_url = f"{Base.local_server_address}{service_name}/{questionId}"

request_parameters = dict(newQuestionNumber="",
                          newQuestionBody="")

server_response = requests.put(action_url, data=request_parameters)
print(f"returned status code: {server_response.status_code}")
print(server_response.text)
validate_json(server_response.text)
