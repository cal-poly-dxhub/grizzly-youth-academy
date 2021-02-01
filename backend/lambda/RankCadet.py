import json
import boto3

from db_config import DB, SECRET_ARN, RESOURCE_ARN
from utility import error_message, find, init_logger

aurora = boto3.client('rds-data')

DEFINITION_OF_POINTS = "SELECT COALESCE(SUM(ActionOption.PointValue), 0) FROM CompletedActions JOIN ActionTemplate ON ActionTemplate.Id = CompletedActions.TemplateId JOIN ActionOption ON ActionOption.Id = ActionTemplate.ActionOptionId WHERE CompletedActions.CadetId = Cadet.Id AND CompletedActions.Evidence != ''"

logger = init_logger()

#RANKINGS FOLLOWING THIS FORMAT:
# ranking is grouped by points, ordered by points descending ex)
#   cadet   | points    | rank
#   C         10          1
#   A         5           2
#   B         5           2
#   D         1           3

#-------------------------------------------------------------------------------

def lambda_handler(event, context):
    logger.info("event: {}".format(event))
    try:
        username = event['identity']['username']
    except:
        return error_message("Unable to resolve cognito username.")

    try:
        action = event['info']['fieldName']
    except:
        return error_message("Unable to resolve requested action.")

    if action == "ListRankedCadets":
        args = event.get('arguments')
        args = args.get('input') if args else args
        return list_ranked_cadets(username, args)

    ranking_info = get_cadet_ranking_info(username)

    #assumption: ranking within class, and then platoons within each class

    class_rankings_stmt = "SELECT (" + DEFINITION_OF_POINTS + ") AS Points FROM Cadet WHERE ClassId = :class_id GROUP BY Points ORDER BY Points DESC;"
    param = [{"name": "class_id", "value": {"longValue": ranking_info['ClassId']}}]
    class_rankings = get_rankings(class_rankings_stmt, param)

    platoon_rankings_stmt = "SELECT (" + DEFINITION_OF_POINTS + ") AS Points FROM Cadet WHERE ClassId = :class_id AND PlatoonId = :platoon_id GROUP BY Points ORDER BY Points DESC;"
    params = [{"name": "class_id", "value": {"longValue": ranking_info['ClassId']}},
              {"name": "platoon_id", "value": {"longValue": ranking_info['PlatoonId']}}]
    platoon_rankings = get_rankings(platoon_rankings_stmt, params)

    cadet_rank = {
        "ClassRank": find(class_rankings, "Points", ranking_info['Points']),
        "MaxClassRank": len(class_rankings),
        "PlatoonRank": find(platoon_rankings, "Points", ranking_info['Points']),
        "MaxPlatoonRank": len(platoon_rankings)
    }
    return cadet_rank


def list_ranked_cadets(username, args):
    attributes = ["Id", "FirstName", "LastName", "Class", "Platoon", "Points", "SharePoints"]
    rank_cadets_stmt = """SELECT    Cadet.{0},
                                    {1},
                                    {2},
                                    Class.Name AS {3},
                                    Platoon.Name AS {4},
                                    ({7}) AS {5},
                                    {6}
                            FROM Cadet
                            JOIN Platoon ON Cadet.PlatoonId = Platoon.Id
                            JOIN Class ON Cadet.ClassId = Class.Id
                            WHERE (Cadet.SharePoints = true or Cadet.CognitoUsername = :user_name)""".format(attributes[0], attributes[1], attributes[2], attributes[3], attributes[4], attributes[5], attributes[6], DEFINITION_OF_POINTS)
    params = [
        { "name": "user_name", "value": {"stringValue": username} }]
    
    if args:
        if args.get('PlatoonId'):
            params.append({ "name": "platoon_id", "value": {"longValue": args['PlatoonId']} })
            rank_cadets_stmt += " AND PlatoonId = :platoon_id"
        if args.get('ClassId'):
            params.append({ "name": "class_id", "value": {"longValue": args['ClassId']} })
            rank_cadets_stmt += " AND ClassId = :class_id"
    
    rank_cadets_stmt += " ORDER BY Points DESC;"

    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = rank_cadets_stmt,
        parameters = params
    )

    ranked_list = []

    for record in response['records']:
        ranked_cadet = {
            attributes[0]: list(record[0].values())[0] if list(record[0].keys())[0] != 'isNull' else None,
            attributes[1]: list(record[1].values())[0] if list(record[1].keys())[0] != 'isNull' else None,
            attributes[2]: list(record[2].values())[0] if list(record[2].keys())[0] != 'isNull' else None,
            attributes[3]: list(record[3].values())[0] if list(record[3].keys())[0] != 'isNull' else None,
            attributes[4]: list(record[4].values())[0] if list(record[4].keys())[0] != 'isNull' else None,
            attributes[5]: list(record[5].values())[0] if list(record[5].keys())[0] != 'isNull' else None,
            attributes[6]: list(record[6].values())[0] if list(record[6].keys())[0] != 'isNull' else None
        }
        ranked_list.append(ranked_cadet)
    return ranked_list


def get_cadet_ranking_info(username):
    attributes = ["Id", "PlatoonId", "ClassId", "Points"]
    get_cadet_ranking_stmt = "SELECT {0}, ({2}) AS {1} FROM Cadet Where CognitoUsername = :user_name;".format(", ".join(attributes[:3]), attributes[3], DEFINITION_OF_POINTS)
    param = [{"name": "user_name", "value": {"stringValue": username}}]
    
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = get_cadet_ranking_stmt,
        parameters = param
    )
    logger.info("get_cadet_ranking_info response: {}".format(response))

    ranking_info = {}
    for i in range(len(attributes)):
        ranking_info[attributes[i]] = int(list(response['records'][0][i].values())[0])
    return ranking_info


def get_rankings(sql_stmt, params):
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = sql_stmt,
        parameters = params
    )

    ranked_list = []
    for user_data in response['records']:
        user_info = {
            "Points": int(list(user_data[0].values())[0])
        }
        ranked_list.append(user_info)
    return ranked_list