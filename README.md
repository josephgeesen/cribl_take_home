# Cribl Take Home Project

## Setup
The project utilizes node/express/fs. To get the project set up:

    npm install
    npm run build

This will install the necessary packages and compile the typescript.

## Running the Project
To run the project:

    node index.js

There are several parameters that can be specified when running the project.

    --logs <log_directory_path>
    To specify a log directory(Default: /var/lib)

    --port <port_number>
    To specify a port(Default: 3001)

    --block <block_size_in_bytes>
    To specify the size of blocks the app will use when reading the log files.(Default: 2097152)

    -ui
    Flag to let the app know to host the ui. If present, the app will provide a basic ui at "http://hostname:<port>/"

Example with parameters in use:

    node index.js --port 3000 --logs C:/Users/josep/Downloads/test_logs

## Accessing the API
To access the api you can make the following requests:

    GET - /api/logs
    RETURNS a list of files
    This API call will return the list of log files in the configured directory, and their sizes.


    GET - /api/log/<log_name>
    PARAMETERS - entries - the number of entries to retrieve (Default: 50)
                 filter - a string to filter the logs by, this is case sensitive
    RETURNS a list of log events
    This API call will return the last n events specified by entries. If a filter is specified it will 
    return the last n events that contain the filter string.
