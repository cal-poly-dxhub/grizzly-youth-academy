import logging

def init_logger():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    return logger

#searches for a value associated with the given key in a list of dictionaries
#returns the index + 1 to indicate rank based on construction of the ranking SQL stmts
def find(lst, key, value):
    for i, dic in enumerate(lst):
        if dic[key] == value:
            return i + 1
    raise ValueError()

def error_message(message):
    return {"errorMessage": message}