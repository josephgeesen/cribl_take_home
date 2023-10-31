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

    node index.js --port 3000 --logs C:/Users/josep/Downloads/test_logs -ui

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

## Example Flow
Here is an example of usage:

    In one terminal:
    node index.js --port 3000 --logs C:/Users/josep/Downloads/test_logs 

In another terminal. Retrieve the list of logs.
    
    $ curl localhost:3001/api/logs
    [{"name":"HDFS.log","size":1577982906},{"name":"ibm.log","size":4461},{"name":"Windows.log","size":28012696901}]

Retrieve events from one of those logs.
    
    $ curl localhost:3001/api/log/Windows.log?entries=10 
    ["2017-05-12 21:24:37, Info                  CBS    Ending TrustedInstaller finalization.","2017-05-12 21:24:37, Inf
    o                  CBS    Starting TrustedInstaller finalization.","2017-05-12 21:24:37, Info                  CBS  
    Ending the TrustedInstaller main loop.","2017-05-12 21:24:37 , Info                  CBS    Trusted Installer signal
    ed for shutdown, going to exit.","2017-05-12 00:03:01, Info  CBS    Unloading offline registry hive: {bf1a281b-ad7b-
    4476-ac95-f47 682990ce7}GLOBALROOT/Device/HarddiskVolumeShado wCopy7/Windows/system32/smi/store/Machine/schema.dat",
    "2017-05-12 00:03:01, Info                  CBS    Unloading o ffline registry hive: {bf1a281b-ad7b-4476-ac95-f47682
    990ce7}GLOBALROOT/Device/Harddi skVolumeShadowCopy7/Users/defau lt/ntuser.dat","2017-05-12 00:03:01, Info           
    CBS    Unloading offline registry hive: {bf1a281b-ad7b-44 76-ac95-f47682990ce7}GLOBALROOT/Device/HarddiskVolumeShado
    wCopy7/Windows/System32/config/DEFAULT","2 017-05-12 00:03 :01, Info                  CBS    Unloading offline regis
    try hive: {bf1a281b-ad7b-4476-ac95-f47682990ce7}GLOBALROOT/ Device/HarddiskVolumeShadowCopy7/Windows/System32/config
    /COMPONENTS","2017-05-12 00:03:01, Info                  CBS Unloading offline registry hive: {bf1a281b-ad7b-4476-ac
    95-f47682990ce7}GLOBALROOT/Device/HarddiskVolumeShadowCopy7/W indows/System32/config/SAM","2017-05-12 00:03:01, Info
    CBS    Unloading offline registry hive: {bf1 a281b-ad7b- 4476-ac95-f47682990ce7}GLOBALROOT/Device/HarddiskVolumeShad
    owCopy7/Windows/System32/config/SECURITY"]

Retrieve filtered events from one of the logs.
    
    $ curl localhost:3001/api/log/Windows.log?entries=10&filter=CBS
    ["2017-05-12 21:24:37, Info                  CBS    Ending TrustedInstaller finalization.","2017-05-12 21:24:37, Inf
    o                  CBS    Starting TrustedInstaller finalization.","2017-05-12 21:24:37, Info                  CBS  
    Ending theTrustedInstaller main loop.","2017-05-12 21:24:37, Info                  CBS    Trusted Installer signaled
    for shutdown, going to exit.","2017-05-12 00:03:01, Info                  CBS    Unloading offline registry hive: {b
    f1a281b-ad7b-4476-ac95-f47682990ce7}GLOBALROOT/Device/HarddiskVolumeShadowCopy7/Windows/system32/smi/store/Machine/s
    chema.dat","2017-05-12 00:03:01, Info                  CBS    Unloading offline registry hive: {bf1a281b-ad7b-4476-a
    c95-f47682990ce7}GLOBALROOT/Device/HarddiskVolumeShadowCopy7/Users/default/ntuser.dat","2017-05-12 00:03:01, Info   
    CBS    Unloading offline registry hive: {bf1a281b-ad7b-4476-ac95-f47682990ce7}GLOBALROOT/Device/HarddiskVolumeShadow
    Copy7/Windows/System32/config/DEFAULT", "2017-05-12 00:03:01, Info                  CBS    Unloading offline registr
    y hive: {bf1a281b-ad7b-4476-ac95-f47682990ce7}GLOBALROOT/Device/HarddiskVolumeShadowCopy7/Windows/System32/config/CO
    MPONENTS","2017-05-12 00:03:01, Info                  CBS    Unloading offline registry hive: {bf1a281b-ad7b-4476-ac
    95-f47682990ce7}GLOBALROOT/Device/HarddiskVolumeShadowCopy7/Windows/System32/config/SAM","2017-05-12 00:03:01, Info 
    CBS    Unloading offline registry hive: {bf1a281b-ad7b-4476-ac95-f47682990ce7}GLOBALROOT/Device/HarddiskVolumeShadow
    Copy7/Windows/System32/config/SECURITY"]

In the first terminal, you will see some new log messages:

    File:Windows.log Size:28012696901
    Execution time: 8
    File:Windows.log Size:28012696901
    Execution time: 7

When the app receives a request, it logs the file name and size.
Upon completion, it also logs the time it took to complete the read.

    
    