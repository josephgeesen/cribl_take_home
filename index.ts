import express from 'express';
import fs from 'fs';
import path from 'path';
import child from 'child_process';

//HOST_UI determines if ui will be hosted
const HOST_UI = (process.argv.indexOf('-ui') > -1);

//PORT will determine the port the server runs on
const portIndex = process.argv.indexOf('--port');
const PORT = (portIndex > -1 && process.argv.length > portIndex + 1)?parseInt(process.argv[portIndex+1]):3001;

//LOG_DIR will determine the directory the app looks for logs in.
const logDirIndex = process.argv.indexOf('--logs');
const LOG_DIR = (logDirIndex > -1 && process.argv.length > logDirIndex + 1)?process.argv[logDirIndex+1]:"/var/log";

console.log(`HOST_UI:${HOST_UI}  PORT:${PORT}  LOG_DIR:${LOG_DIR}`);

// readLog - the function which will actually read the log files and return lines
// TODO: Investigate a pure Node solution instead of child process
const readLog = (filename:string, entries:number|50, filter:string|null, callback:Function) => {
    let fp = path.join(LOG_DIR,filename);

    console.log(`filename:${filename}  entries:${entries}  filter:${filter}`)
    let command = `tail -n${entries} ${fp}`;
    if(filter) {
        command = `tac ${fp} | grep -F -m${entries} ${filter}`;
    }

    //TODO: Investigate modifying this to speed up filters on large log files
    child.exec(command, (err, stdout, stderr) => {
        if(err) {
            console.log(err);
            callback(err);
        }
        if(stderr) {
            console.log(stderr);
        }
        //stdout will return a string, so we need to split it.
        let results = stdout.split("\n");
        //splitting into lines MAY result in an extra empty line, so remove that if it occurs
        if(results.length >= 1 && results[results.length-1] === "") results.pop();
        //results will be in natural order, so reverse them
        callback(null, results.reverse())
    })
}

/* BEGIN API SERVER IMPL */
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
app.get("/api/log/:filename", (req, res) => {
    //Read the route param for filename
    const filename = req.params.filename;

    //Read the request params
    const entries = req.query.entries && typeof req.query.entries == 'string' ? parseInt(req.query.entries) : 50;
    const filter = req.query.filter && typeof req.query.filter == 'string'? req.query.filter : null;

    //console.log(`filename:${filename}  entries:${entries}  filter:${filter}`)

    let met_start = new Date();
    readLog(filename, entries, filter, (err:Error, results:string[]) => {
        let met_stop = new Date();
        if(err) {
            console.log(err);
        }
        console.log(results);
        console.log(`Execution time: ${met_stop.getTime() - met_start.getTime()}`);
        res.send(results);
    });
})

app.listen(PORT, () => {
    console.log(`Log Reader is listening on port ${PORT}`);
});
