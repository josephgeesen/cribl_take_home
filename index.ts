import express from 'express';
import fs from 'fs';

//HOST_UI determines if ui will be hosted
const HOST_UI = (process.argv.indexOf('-ui') > -1);

//PORT will determine the port the server runs on
const portIndex = process.argv.indexOf('--port');
const PORT = (portIndex > -1 && process.argv.length > portIndex + 1)?parseInt(process.argv[portIndex+1]):3001;

//LOG_DIR will determine the directory the app looks for logs in.
const logDirIndex = process.argv.indexOf('--logs');
const LOG_DIR = (logDirIndex > -1 && process.argv.length > logDirIndex + 1)?process.argv[logDirIndex+1]:"/var/log";

console.log(`HOST_UI:${HOST_UI}  PORT:${PORT}  LOG_DIR:${LOG_DIR}`);

const app = express();

//IF HOST_UI is true, then actually provide the GET call for the UI.
if(HOST_UI) {
    app.get("/", (req, res) => {
        //TODO: serve a basic UI for interacting with the rest calls

        res.send("NO UI IN PLACE");
    })
}

//GET LOGS - retrieve a list of log files
app.get("/api/logs", (req , res, next) => {
    // Use fs to read the log file directory.
    fs.readdir(LOG_DIR, (err, files) => {
        // If an error occurs, log it and pass it to express
        if(err) {
            console.log(err);
            next(err);
        } else {
            //Perform a filter to remove any non-log/txt files from the list.
            //TODO: Investigate changing how this filter works.
            //TODO: Investigate returning stats on the files instead of just their names.
            let resp = files.filter((fn)=>{return /^\S+\.(log|txt)/.test(fn)})
            //Return the filtered list
            res.send(resp);
        }
    })
})

//GET LOG - retrieve events from a log file
app.get("/api/log", (req, res) => {
    //TODO: read other parameters
    //TODO: use fs to read lines from the end of designated file
    //TODO: filter the lines
    //TODO: return the log events

    res.send("JUNK RESPONSE - REPLACE");
})

app.listen(PORT, () => {
    console.log(`Log Reader is listening on port ${PORT}`);
});
