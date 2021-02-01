import json
import boto3
import datetime

from db_config import DB, SECRET_ARN, RESOURCE_ARN
from utility import init_logger

#LOGS posted to CloudWatch via IAM role
logger = init_logger()

aurora = boto3.client('rds-data')

#-------------------------------------------------------------------------------

def lambda_handler(event, context):
    logger.info("event: {}".format(event))

    stat_attributes = ["CadetId", "LastName", "FirstName", "ActionId", "ActionTitle", "AssignmentDateTime", "CompletionDateTime", "Evidence"]
    DATE_FORMAT = "%Y-%m-%d"

    retval = {
        "isBase64Encoded": 'false',
        "statusCode": '200',
        "headers": {
            "Accept": "*/*",
            "Content-Type": "text/csv",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Date,X-Amzn-Trace-Id,x-amz-apigw-id,x-amzn-RequestId",
        },
    }

    try:
        startDate = datetime.datetime.strptime(event['queryStringParameters']['startDate'], DATE_FORMAT)
        endDate = datetime.datetime.strptime(event['queryStringParameters']['endDate'], DATE_FORMAT)
    except:
        retval['statusCode'] = '400'
        retval['body'] = json.dumps( {"message": "Invalid startDate/endDate query string parameters."} )
        return retval
    
    start = datetime.datetime.strftime(startDate, DATE_FORMAT)
    end = datetime.datetime.strftime(endDate, DATE_FORMAT)
    
    logger.info("start: {}, end: {}".format(start, end))

    completed_actions_stats = """SELECT Cadet.Id as {0},
                                        Cadet.{1},
                                        Cadet.{2},
                                        ActionOption.Id as {3},
                                        ActionOption.Title AS {4},
                                        CompletedActions.{5},
                                        CompletedActions.{6},
                                        CompletedActions.{7}
                                FROM CompletedActions 
                                JOIN Cadet ON CompletedActions.CadetId = Cadet.Id
                                JOIN ActionTemplate ON ActionTemplate.Id = CompletedActions.TemplateId
                                JOIN ActionOption ON ActionOption.Id = ActionTemplate.ActionOptionId
                                WHERE {6} >= DATE("{8}") AND {6} <= DATE("{9}")
                                ORDER BY {6};
                            """.format(stat_attributes[0], stat_attributes[1], stat_attributes[2], stat_attributes[3], stat_attributes[4], stat_attributes[5], stat_attributes[6], stat_attributes[7], start, end)
    try:
        response = aurora.execute_statement(
            resourceArn = RESOURCE_ARN,
            secretArn = SECRET_ARN,
            database = DB,
            sql = completed_actions_stats
        )
        logger.info("db execute statement response: {}".format(response))
    except:
        retval['statusCode'] = '502'
        retval['body'] = json.dumps( {"message": "cannot access database."} )
        return retval

    csv = ""

    csv += ",".join(stat_attributes) + "\n"

    for record in response.get('records'):
        row = ""
        for i in range(len(record)):
            if list(record[i].keys())[0] != 'isNull':
                row += str(list(record[i].values())[0])
            row += ","
        #ensures that only nonempty records from the database are added to the csv file
        if len(row) > len(record):
            csv += row + "\n"
    retval['body'] = csv

    return retval