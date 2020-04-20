def compose_greeting_text(name):
    if len(name) == 0:
        return "Не передали имя, как я буду приветствовать вообще?"
    else:
        return f"Здрасти-привет, {name}, давно не виделись!"


user_name = ""
message = compose_greeting_text(user_name)
print(message)









