import json


def is_json_correct(json_text: str):
    try:
        json.loads(json_text)
    except ValueError as e:
        return False
    return True


def validate_json(json_text):
    print("======================================================================================")
    print(f"Is json correct? {('YES' if is_json_correct(json_text) else 'IT IS NOT CORRECT!!!')}")


class Base:
    local_server_address = "http://localhost:8080/"
