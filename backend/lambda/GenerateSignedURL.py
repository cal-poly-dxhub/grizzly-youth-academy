import json
import boto3

from utility import init_logger, error_message

logger = init_logger()

#required to identify the S3 bucket that will host these resources
BUCKET = "grizzly-goals-media-repository"

generator = boto3.client('s3')
s3_bucket = boto3.resource('s3').Bucket(BUCKET)

def lambda_handler(event, context):
    logger.info("event object: {}".format(event))

    try:
        #refers to the GraphQL TYPE that this unit resolver is being applied to on a specific attribute
        resource = event['info']['parentTypeName']
    except:
        return error_message("Unable to identify GraphQL Type to resolve S3 location.")
    url = None

    if resource == "Resource":
        try:
            resource_id = event['source']['Id']
            resource_category = event['source']['Category']

            resource_name = resource_category + "/" + str(resource_id)
        except:
            return error_message("Unable to resolve naming parameters for S3 location.")
    elif resource == "Cadet":
        try:
            resource_name = "{0}_{1}".format(event['source']['FirstName'], event['source']['LastName'])
        except:
            return error_message("Unable to resolve naming parameters for S3 location.")
    else:
        logger.info("unidentified resource: {}".format())
        return error_message("Unable to identify requested GraphQL Type.")
    
    #identifies w/o file extension to support returning any file type associated with a resource
    key_prefix = resource + "/" + resource_name
    objs = list(s3_bucket.objects.filter(Prefix=key_prefix))

    #ASSERTS: only one piece of media is associated with a resource at a time
    if len(objs) == 1 and objs[0].key.split(".")[0] == key_prefix:
        key = objs[0].key
        url = generator.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': BUCKET,
                'Key': key
            },
            #ASSERTS: link expires after 60 seconds, but front-end cache stores data immediately
            ExpiresIn=60
        )
    elif len(objs) > 1:
        return error_message("Multiple objects present in S3 with the same prefix.")
    return url