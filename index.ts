import express from 'express';
import fs from 'fs';
import path from 'path';
//Unused import, left in but commented out for demo purposes
//import child from 'child_process';

//HOST_UI determines if ui will be hosted
const HOST_UI = (process.argv.indexOf('-ui') > -1);

//PORT will determine the port the server runs on
const portIndex = process.argv.indexOf('--port');
const PORT = (portIndex > -1 && process.argv.length > portIndex + 1)?parseInt(process.argv[portIndex+1]):3001;

//PORT will determine the port the server runs on
const blockSizeIndex = process.argv.indexOf('--block');
const BLOCK_SIZE = (blockSizeIndex > -1 && process.argv.length > blockSizeIndex + 1)?parseInt(process.argv[blockSizeIndex+1]):2097152;


//LOG_DIR will determine the directory the app looks for logs in.
const logDirIndex = process.argv.indexOf('--logs');
const LOG_DIR = (logDirIndex > -1 && process.argv.length > logDirIndex + 1)?process.argv[logDirIndex+1]:"/var/log";

console.log(`HOST_UI:${HOST_UI}  PORT:${PORT}  LOG_DIR:${LOG_DIR}`);

// readLog - the function which will actually read the log files and return lines
//Unused function, left in but commented out for demo purposes
/*
const readLog = (filename:string, entries:number|50, filter:string|null, callback:Function) => {
    let fp = path.join(LOG_DIR,filename);

    console.log(`filename:${filename}  entries:${entries}  filter:${filter}`)
    let command = `tail -n${entries} ${fp}`;
    if(filter) {
        command = `tac ${fp} | grep -F -m${entries} ${filter}`;
    }

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
 */

const readLog2 = async (filename:string, entries:number|50, filter:string|null, callback:Function) => {
    const fp = path.join(LOG_DIR, filename);

    const existsRE = new RegExp(`${filter}`);
    const filterRE = filter ? new RegExp(`.*${filter}.*$`, 'gm') : new RegExp(`\\S.*$`,'gm');

    let fileBytes = fs.statSync(fp).size;
    //let blockSize = Math.min(524288, fileBytes);
    let blockSize = Math.min(BLOCK_SIZE, fileBytes);
    let position = fileBytes - blockSize;
    let finished = false;
    let leftovers = Buffer.alloc(0);
    let events :string[] = [];

    let bufferDec = Buffer.alloc(blockSize);

    console.log(`File:${filename} Size:${fileBytes}`);

    try {
        //Open the file for reading
        const file = await fs.promises.open(fp);

        //Read the file in chunks starting at the end
        while (!finished) {
            //console.log(`position: ${position}`);
            //Read a chunk of the file
            const buf = await file.read({
                buffer: bufferDec,
                position: position,
                length: blockSize
            });


            //Set up the buffer reference
            let buf1 = buf.buffer;

            //Check to see if the filter exists in this block
            if(!filter || existsRE.test(buf1.toString())) {

                //Combine any leftovers from the previous iteration into the buffer
                if (leftovers.length > 0) {
                    buf1 = Buffer.concat([buf.buffer, leftovers], buf.buffer.length + leftovers.length);
                }

                //If we are not at the beginning of the file, separate the first line in case we do not have the full line
                if (position > 0) {
                    //Find the index of the first line break
                    let firstBreak = buf.buffer.indexOf("\n");

                    //Split the buffer into the leftovers to hand off to the next iteration
                    leftovers = buf.buffer.subarray(0, firstBreak);
                    //And the buffer we will actually check for events
                    buf1 = buf.buffer.subarray(firstBreak + 1);
                }

                //We only care about lines that match our regex
                let re_results = buf1.toString().match(filterRE)

                //If we get any matches we want to concat them into the event list in reverse order
                if (re_results) {
                    events = events.concat(re_results.reverse())
                }

            }
            //If position is 0 we have reached the end of the file(well... the beginning really)
            //If we have more events than asked for, remove the excess
            if(position === 0 || events.length >= entries) {
                finished = true;
                events = events.slice(0,entries);
            }

            //if our current position is smaller than the blockSize
            // set the position to 0, as we are at the beginning of the file
            // also set the blockSize to the position to prevent data overlap
            if(position < blockSize) {
                blockSize = position;
                position = 0;
            }
            //Otherwise, set the new position by subtracting the block size from it.
            else {
                position -= blockSize;
            }

        }

        //Send the results back via callback
        callback(null, events);

        //Close the file
        await file.close();


    } catch(err) {
        console.error(err);
    }
}

const readDir = async (callback:Function) => {
    try {
        //Asynchronously retrieve the list of files
        const files = await fs.promises.readdir(path.join(LOG_DIR));

        let file_results : {name:string,size:number}[] = []

        //Loop through the files to get their sizes
        for (const file of files) {
            const fileBytes = fs.statSync(path.join(LOG_DIR, file)).size;
            file_results.push({
                name:file,
                size:fileBytes
            });
        }

        //Return the files via the callback
        callback(null, file_results);
    }
    catch (err) {
        console.error(err)
        callback(err);
    }
}
/* BEGIN API SERVER IMPL */
const app = express();

//IF HOST_UI is true, then actually provide the GET call for the UI.
if(HOST_UI) {
    app.use('/', express.static(path.join(__dirname, 'ui/')));
}

//GET LOGS - retrieve a list of log files
app.get("/api/logs", (req , res, next) => {
    // Use fs to read the log file directory.
    readDir((err:Error, files:{name:string,size:number}[]) => {
        if(err) {
            console.error(err);
            next(err);
        } else {
            res.send(files);
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

    //Just for personal diagnostics, take a start time
    let met_start = new Date();
    readLog2(filename, entries, filter, (err:Error, results:string[]) => {
        //Capture the time we get a return from the readLog function
        let met_stop = new Date();

        if(err) {
            console.error(err);
        }

        //Log the execution time in ms.
        console.log(`Execution time: ${met_stop.getTime() - met_start.getTime()}`);

        //Send the results to the UI.
        res.send(results);
    });
    //Unused function path that utilized grep/tac/tail to fetch the log events
    /*
    readLog(filename, entries, filter, (err:Error, results:string[]) => {
        let met_stop = new Date();
        if(err) {
            console.log(err);
        }
        console.log(results);
        console.log(`Execution time: ${met_stop.getTime() - met_start.getTime()}`);
        res.send(results);
    });
     */
})

app.listen(PORT, () => {
    console.log(`Log Reader is listening on port ${PORT}`);
});
