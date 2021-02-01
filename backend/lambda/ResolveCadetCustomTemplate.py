import json
import boto3
import datetime

from db_config import DB, RESOURCE_ARN, SECRET_ARN
from utility import init_logger, error_message

#This source code for the ResolveCadetCustomTemplate lambda function includes backend logic for all template-related APIs

#NOTE:  *   All dates in the DB are in UTC format.
#       *   Three methods of scheduling an action: on a specific date, select days of the week on a recourring weekly basis, a single day on a reocurring monthly basis
#
#       *   params required for assigned actions: (all generally assigned actions require DefaultTime; all custom assigned actions require DefaultTime and DefaultDate)
#       *   -> specific date => (DefaultDate for generally assigned actions)
#       *   -> variable days of the week on a reoccurring basis => DefaultDaysOfWeek (and DefaultWeeklyFrequency)
#       *   -> day of the month on a reoccuring basis => DefaultDayOfMonth (and DefaultMonthlyFrequency)

#direct areas for improvement:
#   RESOLVED ON 2020-12-18 - line ~263: `and not scheduled_on_date` implies that the DefaultDate parameter can't be combined with a weekly or monthly scheduling
#   RESOLVED ON 2021-01-08 - error checking implemented with simple error message response.
#   weekly/monthly frequency not implemented (used to determine if an action should be scheduled ever X weeks/months, where X is the value for DefaultWeeklyFrequency/DefaultMonthlyFrequency)

#LOGS posted to CloudWatch via IAM role
logger = init_logger()

aurora = boto3.client('rds-data')

DATE_FORMAT = "%Y-%m-%d"
TIME_FORMAT = "%H:%M:%S"

#-------------------------------------------------------------------------------

def lambda_handler(event, context):
    logger.info(event)
    
    try:
        #name of the API
        action = event['info']['fieldName']
    except:
        return error_message("Unable to resolve requested action.")
    
    try:
        username = event['identity']['username']
    except:
        return error_message("Unable to resolve cognito username.")
    
    try:
        user_id = get_cadet_id(username)
    except:
        return error_message("Unable to determine the user in the database.")

    #associate a user to the API call
    logger.info("AppSync API CALL: user - {0}; API - {1}".format(username, action))
    
    if action == "ListAssignedActions":
        #current form of pagination to return assigned actions with assigned dates per each requested month/year combination
        try:
            month = int(event['arguments']['month'])
            year = int(event['arguments']['year'])
        except:
            return error_message("Insufficient time pagination provided.")

        action_template = get_template(user_id)
        completed_action_dates = get_completed_action_dates(user_id, month, year)
        deleted_action_dates = get_deleted_action_dates(user_id, month, year)
        return get_user_action_data(action_template, completed_action_dates, deleted_action_dates, month, year)
    
    elif action == "ListCompletedActions":
        return get_all_completed_actions(user_id)
    
    try:
        #Each API aside from `ListAssignedActions` takes only an input object as an argument
        arguments = event['arguments']['input']
    except:
        return error_message("Unable to resolve input object in arguments.")
    
    if action == "CompleteAssignedAction":
        try:
            action_template_id = arguments['TemplateId']
            assignment_datetime = arguments['AssignmentDateTime']
            evidence = arguments['Evidence']
        except:
            return error_message("Unable to resolve TemplateId, AssignmentDateTime, or Evidence in arguments.")

        return complete_assigned_action(user_id, action_template_id, assignment_datetime, evidence)
    
    elif action == "AssignActionOption":
        try:
            action_option_id = event['arguments']['input']['ActionOptionId']
        except:
            return error_message("Unable to resolve ActionOptionId in arguments.")

        return assign_action_option(user_id, action_option_id, arguments)
    
    elif action == "AssignCustomAction":
        try:
            action_option_id = create_action_option(user_id, arguments)
        except:
            return error_message("Unable to resolve necessary arguments for custom ActionOption.")
        
        return assign_action_option(user_id, action_option_id, arguments)
    
    elif action == "UpdateActionSchedule":
        if not (arguments.get("DefaultTime") and arguments.get("TemplateId")):
            return error_message("Unable to resolve DefaultTime in updated schedule arguments.")
        
        return update_action_schedule(user_id, arguments)
    
    elif action == "DeleteAssignedActionDate":
        try:
            template_id = arguments['TemplateId']
            assignment_datetime = arguments['AssignmentDateTime']
        except:
            return error_message("Unable to resolve TemplateId or AssignmentDateTime in arguments.")

        return delete_assigned_action_date(user_id, template_id, assignment_datetime)
    
    elif action == "DeleteActionFromTemplate":
        try:
            template_id = arguments['TemplateId']
        except:
            return error_message("Unable to resolve TemplateId in arguments.")

        return delete_action_from_template(user_id, template_id)
    return {}

#-------------------------------------------------------------------------------

def get_cadet_id(username):
    get_cadet_stmt = "SELECT Id FROM Cadet Where CognitoUsername = :user_name;"
    param = [{"name": "user_name", "value": {"stringValue": username}}]
    
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = get_cadet_stmt,
        parameters = param
    )
    cadet_id = response['records'][0][0]['longValue']
    return cadet_id


'''
returns a set of objects of the form:
{
    TemplateId: ...,
    ActionOptionId: ...,
    CadetId: ...,
    Schedule: {
        DefaultTime: ...,
        DefaultDate: ...,
        DefaultDaysOfWeek: ...,
        DefaultWeeklyFrequency: ...,
        DefaultDayOfMonth: ...,
        DefaultMonthlyFrequency: ...
    }
}
'''
    
def get_template(user_id):
    #NOTE: re-structure SQL statements if changing the ordering/names of these values
    assigned_action_attributes = ["TemplateId", "ActionOptionId", "CadetId"]
    schedule_attributes = ["DefaultTime", "DefaultDate", "DefaultDaysOfWeek", "DefaultWeeklyFrequency", "DefaultDayOfMonth", "DefaultMonthlyFrequency"]

    action_template_stmt="""SELECT  ActionTemplate.Id AS {1},
                                    ActionTemplate.{2} AS {2},
                                    ActionTemplate.{3} AS {3},
                            		IF(TemplateUpdates.TemplateId = ActionTemplate.Id,
                            			TemplateUpdates.{4}, 
                                        ActionTemplate.{4})
                                        AS {4},
                            		IF(TemplateUpdates.TemplateId = ActionTemplate.Id,
                            			TemplateUpdates.{5},
                                        ActionTemplate.{5})
                                        AS {5},
                            		IF(TemplateUpdates.TemplateId = ActionTemplate.Id,
                            			TemplateUpdates.{6},
                            			ActionTemplate.{6})
                            			AS {6},
                            		IF(TemplateUpdates.TemplateId = ActionTemplate.Id,
                            			TemplateUpdates.{7},
                            			ActionTemplate.{7})
                                        AS {7},
                                    IF(TemplateUpdates.TemplateId = ActionTemplate.Id,
                            			TemplateUpdates.{8},
                                        ActionTemplate.{8})
                                        AS {8},
                            		IF(TemplateUpdates.TemplateId = ActionTemplate.Id,
                            			TemplateUpdates.{9},
                            			ActionTemplate.{9})
                                        AS {9}
                            FROM ActionTemplate
                            JOIN Cadet ON Cadet.Id = {0}
                            LEFT JOIN TemplateUpdates ON ActionTemplate.Id = TemplateUpdates.TemplateId AND TemplateUpdates.CadetId = Cadet.Id
                            WHERE (ActionTemplate.CadetId IS NULL OR ActionTemplate.CadetId = Cadet.Id) AND
                            ActionTemplate.Id NOT IN   (SELECT TemplateId
                                                        FROM TemplateDeletions
                                                        WHERE CadetId = Cadet.Id);""".format(user_id, assigned_action_attributes[0], assigned_action_attributes[1], assigned_action_attributes[2], schedule_attributes[0], schedule_attributes[1], schedule_attributes[2], schedule_attributes[3], schedule_attributes[4], schedule_attributes[5])
    
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = action_template_stmt
    )
    #logger.info("API RESPONSE `action template`: {}".format(response))
    
    action_template = []
    
    for record in response.get('records'):
        action_item = { "Schedule": {} }
        #boolean var to indicate if the API response found a null value for a given attribute in the query
        field_not_null = True

        #action item field is set to the aurora API response in the same order as the values in the above query
        for i in range(0, len(assigned_action_attributes)):
            field_not_null = list(record[i].keys())[0] != 'isNull'
            action_item[assigned_action_attributes[i]] = list(record[i].values())[0] if field_not_null else None
        
        for i in range(0, len(schedule_attributes)):
            field_not_null = list(record[i + len(assigned_action_attributes)].keys())[0] != 'isNull'
            action_item['Schedule'][schedule_attributes[i]] = list(record[i + len(assigned_action_attributes)].values())[0] if field_not_null else None
        
        action_template.append(action_item)
    
    logger.info("user id: {0} - action template: {1}".format(user_id, action_template))
    return action_template


def get_completed_action_dates(cadet_id, month, year):
    completed_assigned_actions = """SELECT TemplateId, AssignmentDateTime
                                    FROM CompletedActions
                                    WHERE CadetId = {0}
                                    AND MONTH(AssignmentDateTime) = {1}
                                    AND YEAR(AssignmentDateTime) = {2}
                                    AND TemplateId NOT IN (SELECT TemplateId
                                                           FROM TemplateDeletions
                                                           WHERE CadetId = {0});""".format(cadet_id, month, year)
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = completed_assigned_actions
    )
    #logger.info("API RESPONSE `completed actions`: {}".format(response))
    
    completed_actions = []
    for record in response.get('records'):
        completed_action = {
            "TemplateId": int(list(record[0].values())[0]),
            "AssignmentDateTime":  list(record[1].values())[0]
        }
        completed_actions.append(completed_action)
    return completed_actions


def get_deleted_action_dates(user_id, month, year):
    get_deleted_actions_stmt = """  SELECT  TemplateId,
                                            AssignmentDateTime
                                    FROM ActionDateDeletions
                                    WHERE CadetId = {0}
                                        AND MONTH(AssignmentDateTime) = {1} 
                                        AND YEAR(AssignmentDateTime) = {2}
                                        AND TemplateId NOT IN (SELECT TemplateId
                                                           FROM TemplateDeletions
                                                           WHERE CadetId = {0});""".format(user_id, month, year)
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = get_deleted_actions_stmt
    )
    #logger.info("API RESPONSE `deleted action dates`: {}".format(response))
    
    deleted_action_dates = []
    for record in response.get('records'):
        deleted_action = {
            "TemplateId": int(list(record[0].values())[0]),
            "AssignmentDateTime":  list(record[1].values())[0]
        }
        deleted_action_dates.append(deleted_action)
    return deleted_action_dates


def get_user_action_data(action_template, completed_actions, deleted_action_dates, month, year):
    week_map = { "M": 0, "T": 1, "W": 2, "H": 3, "F": 4, "S": 5, "D": 6 }

    today = datetime.datetime.utcnow()
    beginning_of_month = datetime.datetime(year=year, month=month, day=1)
    
    assignment_set = []
    
    for action_item in action_template:
        scheduled_weekly = False
        scheduled_monthly = False
        scheduled_on_date = False
        
        assigned_action = {
            "TemplateId": action_item['TemplateId'],
            "Action": get_action_option(action_item['ActionOptionId']),
            "CadetId": action_item.get("CadetId"),
            "AssignedDates": []#,
            #"CompletedDates": []
        }
        completed_dates = []

        #adds completed actions appearing in the requested month/year to the corresponding assigned action object
        for completed_action in completed_actions:
            if assigned_action['TemplateId'] == completed_action['TemplateId']:
                completed_dates.append(completed_action['AssignmentDateTime'])
        
        schedule = action_item['Schedule']
        logger.info("template {0} - schedule: {1}".format(assigned_action['TemplateId'], schedule))

        time_info = schedule['DefaultTime'].split(":")
        assigned_time = datetime.time(hour=int(time_info[0]), minute=int(time_info[1]))

        #store weekly frequency info and boolean var to identify if weekly scheduling was implemented
        if schedule.get('DefaultDaysOfWeek') and len(schedule['DefaultDaysOfWeek']) > 0:# and schedule.get('DefaultWeeklyFrequency'):
            scheduled_weekdays = [week_map.get(day) for day in schedule['DefaultDaysOfWeek']]
            scheduled_weekly = True
        
        #store boolean var to identify if monthly scheduling was implemented
        scheduled_monthly = schedule.get('DefaultDayOfMonth') != None #and schedule.get('DefaultMonthlyFrequency') != None
        
        #store boolean var to identify if assigned on specific date
        #scheduled_on_date being True implies one of two things:
        # ->    the action is scheduled on a single date
        # ->    the action was scheduled to start on DefaultDate, and has a weekly or monthly frequency to produce assigned dates afterwards
        scheduled_on_date = schedule.get('DefaultDate') != None

        if scheduled_on_date:
            scheduled_date = datetime.datetime.combine(datetime.datetime.strptime(schedule['DefaultDate'], DATE_FORMAT), assigned_time)

            #add scheduled date to list if standalone assigned action is on the correct month/year
            if not (scheduled_weekly or scheduled_monthly) and scheduled_date.month == month and scheduled_date.year == year and str(scheduled_date) not in completed_dates:
                assigned_action['AssignedDates'].append(str(scheduled_date))

        pointer_date = datetime.datetime.combine(beginning_of_month.date(), assigned_time)

        #ignores frequency values for now... (needs a way to track between API calls on separate months)
        while pointer_date.month == month and (scheduled_weekly or scheduled_monthly):
            if scheduled_weekly:
                #ensure that the pointer is set to a requested weekday and it is not already marked as completed
                if pointer_date.weekday() in scheduled_weekdays and str(pointer_date) not in completed_dates:

                    #asserts that generally/auto-assigned actions only report assigned dates including and after `today`
                    if assigned_action.get('CadetId') or ( not assigned_action.get('CadetId') and ( pointer_date.date() >= today.date() ) ):

                        #edge case for custom assigned actions to only schedule reoccuring events after the selected date
                        if (scheduled_on_date and pointer_date >= scheduled_date) or not scheduled_on_date:
                            assigned_action['AssignedDates'].append(str(pointer_date))
            
            if scheduled_monthly:
                #ensure that the pointer is set to the requested day of the month and it is not already marked as completed
                if pointer_date.day == int(schedule['DefaultDayOfMonth']) and str(pointer_date) not in completed_dates:

                    #asserts that generally/auto-assigned actions only report assigned dates including and after `today`
                    if assigned_action.get('CadetId') or ( not assigned_action.get('CadetId') and ( pointer_date.date() >= today.date() ) ):

                        #edge case for custom assigned actions to only schedule reoccuring events after the selected date
                        if (scheduled_on_date and pointer_date >= scheduled_date) or not scheduled_on_date:
                            assigned_action['AssignedDates'].append(str(pointer_date))
            
            pointer_date += datetime.timedelta(days=1)
        
        for deleted_action in deleted_action_dates:
            if assigned_action['TemplateId'] == deleted_action['TemplateId']:
                try:
                    assigned_action['AssignedDates'].remove(str(deleted_action['AssignmentDateTime']))
                except:
                    pass
        
        if len(assigned_action['AssignedDates']):
            logger.info("template {0} - assigned action: {1}".format(assigned_action['TemplateId'], assigned_action))
            assignment_set.append(assigned_action)
    return assignment_set


def get_all_completed_actions(user_id):
    completed_actions_stmt = """SELECT  ActionTemplate.Id as TemplateId,
                                        ActionTemplate.ActionOptionId,
                                        ActionTemplate.CadetId,
                                        CompletedActions.AssignmentDateTime
                                FROM CompletedActions
                                JOIN ActionTemplate ON CompletedActions.TemplateId = ActionTemplate.Id
                                WHERE CompletedActions.CadetId = {}
                                ORDER BY TemplateId, AssignmentDateTime;""".format(user_id)
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = completed_actions_stmt
    )
    logger.info("API RESPONSE `completed actions`: {}".format(response))

    completed_actions = []
    assigned_action = None

    current_template_id = -1
    for record in response.get('records'):
        if current_template_id != list(record[0].values())[0]:
            if current_template_id != -1:
                completed_actions.append(assigned_action)
            
            current_template_id = list(record[0].values())[0]
            assigned_action = {
                    "TemplateId": list(record[0].values())[0],
                    "Action": get_action_option(list(record[1].values())[0]),
                    "CadetId": list(record[2].values())[0] if list(record[2].keys())[0] != 'isNull' else None,
                    "CompletedDates": []
            }
        assigned_action['CompletedDates'].append(list(record[3].values())[0])
    #adds the remaining completed action object to the list
    if assigned_action != None:
        completed_actions.append(assigned_action)
    return completed_actions


def get_action_option(action_option_id):
    #attributes of action option in the database
    attributes = ["Id", "GoalId", "Title", "Description", "MediaURL", "PointValue"]
    
    get_action_option_stmt = "SELECT {} FROM ActionOption WHERE Id = :action_option_id".format(", ".join(attributes))
    param = [{"name": "action_option_id", "value": format_param_value(action_option_id)}]
    
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = get_action_option_stmt,
        parameters = param
    )
    logger.info("API RESPONSE `action option`: {}".format(response))
    
    action = {}
    for i in range(len(attributes)):
        action[attributes[i]] = list(response['records'][0][i].values())[0] if list(response['records'][0][i].keys())[0] != 'isNull' else None
    return action

#formats params on calls to `aurora.execute_statement(...)` as per aws doc specification: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/rds-data.html
def format_param_value(param):
    if type(param) == int:
        return {"longValue": param}
    elif type(param) == float:
        return {"doubleValue": param}
    elif type(param) == str:
        return {"stringValue": param}
    elif type(param) == bool:
        return {"booleanValue": param}
    elif param == None:
        return {"isNull": True}
    else:
        raise ValueError("Unrecognized parameter type")


def complete_assigned_action(user_id, action_template_id, assignment_datetime, evidence):
    complete_action_stmt = "INSERT INTO CompletedActions(TemplateId, CadetId, AssignmentDateTime, CompletionDateTime, Evidence) VALUES(:action_template_id, :user_id, :assignment_datetime, NOW(), :evidence);"
    params = [
        { "name": "action_template_id", "value": format_param_value(action_template_id) },
        { "name": "user_id", "value": format_param_value(user_id) },
        { "name": "assignment_datetime", "value": format_param_value(assignment_datetime) },
        { "name": "evidence", "value": format_param_value(evidence) }
    ]
    
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = complete_action_stmt,
        parameters = params
    )
    logger.info("API RESPONSE `complete action`: {}".format(response))
    
    return { "TemplateId": action_template_id }


def assign_action_option(user_id, action_option_id, args):
    create_action_template_record_stmt = """INSERT INTO ActionTemplate( ActionOptionId,
                                                                        CadetId,
                                                                        DefaultTime,
                                                                        DefaultDate,
                                                                        DefaultDaysOfWeek,
                                                                        DefaultWeeklyFrequency,
                                                                        DefaultDayOfMonth,
                                                                        DefaultMonthlyFrequency,
                                                                        CreationDateTime)
                                                                VALUES( :action_option_id,
                                                                        :user_id,
                                                                        :default_time,
                                                                        :default_date,
                                                                        :default_days_of_week,
                                                                        :default_weekly_frequency,
                                                                        :default_day_of_month, 
                                                                        :default_monthly_frequency,
                                                                        NOW());"""
    params = [
        { "name": "action_option_id", "value": format_param_value(action_option_id) },
        { "name": "user_id", "value": format_param_value(user_id) },
        { "name": "default_time", "value": format_param_value(args.get("DefaultTime")) },
        { "name": "default_date", "value": format_param_value(args.get("DefaultDate")) },
        { "name": "default_days_of_week", "value": format_param_value(args.get("DefaultDaysOfWeek")) },
        { "name": "default_weekly_frequency", "value": format_param_value(args.get("DefaultWeeklyFrequency")) },
        { "name": "default_day_of_month", "value": format_param_value(args.get("DefaultDayOfMonth")) },
        { "name": "default_monthly_frequency", "value": format_param_value(args.get("DefaultMonthlyFrequency")) }
    ]
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = create_action_template_record_stmt,
        parameters = params
    )
    logger.info("API RESPONSE `assign action option`: {}".format(response))

    template_id = response['generatedFields'][0]['longValue']
    #action_option = get_action_option(action_option_id)
    
    return { "TemplateId": template_id }


def create_action_option(user_id, args):
    create_action_option_stmt = "INSERT INTO ActionOption(GoalId, CadetId, Title, Description, MediaURL, Saved) VALUES(:goal_id, :user_id, :title, :description, :media_url, :saved);"
    params = [
        { "name": "goal_id", "value": format_param_value(args.get("GoalId")) },
        { "name": "user_id", "value": format_param_value(user_id) },
        { "name": "title", "value": format_param_value(args.get("Title")) },
        { "name": "description", "value": format_param_value(args.get("Description")) },
        { "name": "media_url", "value": format_param_value(args.get("MediaURL")) },
        { "name": "saved", "value": format_param_value(args.get("Saved")) }
    ]
    
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = create_action_option_stmt,
        parameters = params
    )
    logger.info("API RESPONSE `create action option`: {}".format(response))
    
    action_option_id = response['generatedFields'][0]['longValue']
    return action_option_id


def update_action_schedule(user_id, args):
    action_template_id = args.get("TemplateId")
    params = [
        { "name": "action_template_id", "value": format_param_value(action_template_id) },
        { "name": "user_id", "value": format_param_value(user_id) },
        { "name": "default_time", "value": format_param_value(args.get("DefaultTime")) },
        { "name": "default_date", "value": format_param_value(args.get("DefaultDate")) },
        { "name": "default_days_of_week", "value": format_param_value(args.get("DefaultDaysOfWeek")) },
        { "name": "default_weekly_frequency", "value": format_param_value(args.get("DefaultWeeklyFrequency")) },
        { "name": "default_day_of_month", "value": format_param_value(args.get("DefaultDayOfMonth")) },
        { "name": "default_monthly_frequency", "value": format_param_value(args.get("DefaultMonthlyFrequency")) }
    ]
    
    if update_exists(user_id, action_template_id):
        #sql stmt updates all values in TemplateUpdates as per the specification of how updates to ActionTemplate records are applied
        update_stmt = "UPDATE TemplateUpdates SET DefaultTime = :default_time, DefaultDate = :default_date, DefaultDaysOfWeek = :default_days_of_week, DefaultWeeklyFrequency = :default_weekly_frequency, DefaultDayOfMonth = :default_day_of_month, DefaultMonthlyFrequency = :default_monthly_frequency WHERE TemplateId = :action_template_id AND CadetId = :user_id"
    else:
        update_stmt = "INSERT INTO TemplateUpdates(TemplateId, CadetId, DefaultTime, DefaultDate, DefaultDaysOfWeek, DefaultWeeklyFrequency, DefaultDayOfMonth, DefaultMonthlyFrequency) VALUES(:action_template_id, :user_id, :default_time, :default_date, :default_days_of_week, :default_weekly_frequency, :default_day_of_month, :default_monthly_frequency);"
        
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = update_stmt,
        parameters = params
    )
    logger.info("API RESPONSE `update assigned action`: {}".format(response))

    return { "TemplateId": action_template_id }


def update_exists(user_id, action_template_id):
    check_existing_update_stmt = "SELECT TemplateId FROM TemplateUpdates WHERE CadetId = :user_id AND TemplateId = :action_template_id"
    params = [
        { "name": "action_template_id", "value": format_param_value(action_template_id) },
        { "name": "user_id", "value": format_param_value(user_id) }
    ]
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = check_existing_update_stmt,
        parameters = params
    )
    #boolean response to identify if record already exists in DB
    return len(response.get('records')) == 1


def delete_assigned_action_date(user_id, action_template_id, assignment_datetime):
    delete_assignment_stmt = "INSERT INTO ActionDateDeletions(TemplateId, CadetId, AssignmentDateTime, CreationDateTime) VALUES(:action_template_id, :user_id, :assignment_datetime, NOW());"
    params = [
        { "name": "action_template_id", "value": format_param_value(action_template_id) },
        { "name": "user_id", "value": format_param_value(user_id) },
        { "name": "assignment_datetime", "value": format_param_value(assignment_datetime) }
    ]
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = delete_assignment_stmt,
        parameters = params
    )
    logger.info("API RESPONSE `delete assigned action date`: {}".format(response))

    return { "TemplateId": action_template_id }


def delete_action_from_template(user_id, action_template_id):
    delete_assignment_stmt = "INSERT INTO TemplateDeletions(TemplateId, CadetId) VALUES(:action_template_id, :user_id);"
    params = [
        { "name": "action_template_id", "value": format_param_value(action_template_id) },
        { "name": "user_id", "value": format_param_value(user_id) }
    ]
    response = aurora.execute_statement(
        resourceArn = RESOURCE_ARN,
        secretArn = SECRET_ARN,
        database = DB,
        sql = delete_assignment_stmt,
        parameters = params
    )
    logger.info("API RESPONSE `delete action from template`: {}".format(response))

    return { "TemplateId": action_template_id }