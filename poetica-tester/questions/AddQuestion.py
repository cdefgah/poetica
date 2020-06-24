import requests

from Base import validate_json, Base

service_name = "/questions"
action_url = f"{Base.local_server_address}{service_name}"

request_parameters = dict(questionNumber='R02',
                          questionBody='Смело вступить в какашку\nИ громко хохотаць!\n[....]\n[.....]',
                          isOutOfCompetition=True)

server_response = requests.post(action_url, data=request_parameters)
print(server_response.text)
validate_json(server_response.text)
