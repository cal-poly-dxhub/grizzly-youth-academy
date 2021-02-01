import json
import codecs, csv
import boto3
import datetime

from db_config import DB, RESOURCE_ARN, SECRET_ARN
from utility import init_logger

#This lambda function is triggered by a POST to an S3 bucket

#requirements:
# - DefaultTime must be ingested before other scheduling values so that a time change can be determined

#Future update for wide application:
# - add current time zone to input to determine the offset of the utc_format method, then replace hard-coded UTC_TIME_OFFSET

logger = init_logger()

s3 = boto3.resource('s3')
aurora = boto3.client('rds-data')

#adds 8 hours to the input time info
UTC_TIME_OFFSET = 8

#assumption that actions planned towards the end of the month on a recurring basis will be less than or equal to MAX_DAY_OF_MONTH
MAX_DAY_OF_MONTH = 28

DATE_FORMAT = "%Y-%m-%d"
TIME_FORMAT = "%H:%M:%S"


def lambda_handler(event, context):
    logger.info("event: {}".format(event))
    
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    table = key.split("/")[0]
    
    #get() does not store in memory
    try:
        obj = s3.Object(bucket, key).get()['Body']
    except:
       logger.info("S3 Object could not be opened.")

    values = None
    sql_stmt = None

    #DictReader is a generator; not stored in memory
    for row in csv.DictReader(codecs.getreader('utf-8')(obj)):
        logger.info("input data:\t{}".format(row))
        
        header, values = format_template(row) if table == "ActionTemplate" else format_values(row)
        
        sql_stmt = 'INSERT INTO {0}({1}) VALUES({2});'.format(table, ", ".join(header), ", ".join(values))
        logger.info("sql stmt: {}".format(sql_stmt))
        
        try:
            response = aurora.execute_statement(
                database=DB,
                secretArn=SECRET_ARN,
                resourceArn=RESOURCE_ARN,
                sql=sql_stmt
            )
            logger.info("statement execution response: {}".format(response))
        except Exception as e:
            logger.error(str(e))
        
    return { 'statusCode': 200, 'body': json.dumps('Uploaded to Aurora MySQL DB') }


def format_values(row):
    headers = [attr for attr in row.keys()]
    values = [row.get(attr) for attr in headers]
    
    for i in range(len(values)):
        if not values[i].isnumeric():
            values[i] = "NULL" if len(values[i]) == 0 else "\"{}\"".format(values[i])
    return headers, values


'''
- format of row
{
    "ActionOptionId": ~,
    "CadetId": ~,
    "DefaultTime": ~,
    "DefaultDate": ~,
    "DefaultDaysOfWeek": ~,
    "DefaultWeeklyFrequency": ~,
    "DefaultDayOfMonth": ~,
    "DefaultMonthlyFrequency": ~
}
'''
#special method for inserting records into ActionTemplate table (required for normalization of DB date/time/datetime values in UTC format)
def format_template(row):
    headers = [attr for attr in row.keys()]
    values = [row.get(attr) for attr in headers]
    edit_dates = False

    try:
        given_time = datetime.datetime.strptime(row['DefaultTime'], TIME_FORMAT)
    except:
        given_time = datetime.datetime.strptime(row['DefaultTime'], "%H:%M")
    finally:
        utc_time = given_time + datetime.timedelta(hours=UTC_TIME_OFFSET)
        values[headers.index('DefaultTime')] = "\"{}\"".format(datetime.datetime.strftime(utc_time, TIME_FORMAT))
        if utc_time.time() < given_time.time():
            edit_dates = True
    
    if row.get("DefaultDate"):
        if not edit_dates:
            values[headers.index('DefaultDate')] = "\"{}\"".format(row['DefaultDate'])
        else:
            utc_date = datetime.datetime.strptime(row['DefaultDate'], DATE_FORMAT) + datetime.timedelta(days=1)
            values[headers.index('DefaultDate')] = "\"{}\"".format(datetime.datetime.strftime(utc_date, DATE_FORMAT))
    
    if row.get("DefaultDaysOfWeek"):
        week_map = { "M": 0, "T": 1, "W": 2, "H": 3, "F": 4, "S": 5, "D": 6 }
        inverse_map = { 0: "M", 1: "T", 2: "W", 3: "H", 4: "F", 5: "S", 6: "D" }
        if not edit_dates:
            values[headers.index('DefaultDaysOfWeek')] = "\"{}\"".format(row['DefaultDaysOfWeek'])
        else:
            scheduled_days = [week_map.get(day) for day in row.get("DefaultDaysOfWeek")]
            scheduled_days = list(set(scheduled_days)) #get distinct values
            for i in range(len(scheduled_days)):
                scheduled_days[i] = (scheduled_days[i] + 1) % 7
            scheduled_days.sort()
            values[headers.index('DefaultDaysOfWeek')] = "\"{}\"".format("".join([inverse_map.get(num) for num in scheduled_days]))
    
    if row.get('DefaultDayOfMonth') and edit_dates:
        values[headers.index('DefaultDayOfMonth')] = str(int(row['DefaultDayOfMonth']) + 1  ) % (MAX_DAY_OF_MONTH + 1)

    for i in range(len(values)):
        if len(str(values[i])) == 0:
            values[i] = "NULL"
    return headers, values