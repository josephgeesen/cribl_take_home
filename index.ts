import * as express from 'express';
//TODO: import fs and implement it.
//TODO: access/create the properties file

const app = express();

app.get("/", (req,res) => {
    //TODO: serve a basic UI for interacting with the rest calls

    res.send("NO UI IN PLACE");
})

//GET LOGS - retrieve a list of log files
app.get("/api/logs", (req , res) => {
    //TODO: read the apikey and verify it
    //TODO: use fs to retrieve the file list in the logs directory
    //TODO: return the list of files

    res.send("JUNK RESPONSE - REPLACE");
})

//GET LOG - retrieve events from a log file
app.get("/api/log", (req, res) => {
    //TODO: read the apikey and verify it
    //TODO: read other parameters
    //TODO: use fs to read lines from the end of designated file
    //TODO: filter the lines
    //TODO: return the log events

    res.send("JUNK RESPONSE - REPLACE");
})

app.listen(3000, () => {
    console.log(`Log Reader is listening on port 3000`);
});
