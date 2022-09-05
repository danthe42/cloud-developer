import fs from "fs";
import Jimp = require("jimp");
import { spawn } from 'child_process';

export function filter(input_base64: string , filteredfname: string) : Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
        const cmdargs : Array<string> = [ __dirname + '/image_filter.py', filteredfname ];
        console.log("Executing: " + cmdargs);

        const process = spawn('python3', cmdargs);
            
        process.stdin.write( input_base64.toString() );
        process.stdin.end();

        let filter_stdout_data : string = "";
        let filter_stderr_data : string = "";
        process.stdout.on( 'data', (data) => { filter_stdout_data+=data; })
        process.stderr.on( 'data', (data) => { filter_stderr_data+=data; })

        process.on('close', function (exitCode) { 
          if( exitCode ) {

            console.error("Python stdout: " + filter_stdout_data);
            console.error("Python stderr: " + filter_stderr_data);
            reject( `Python subprocess exited with error code ` + exitCode );
          }
          
          resolve(""); 
        });
        
        process.on('error', function (err) { 
          reject(err);
        });      
  } catch (error) {
    console.error(error.toString());
    reject(error.toString());
  }
  });
};

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const rndnum : number = Math.floor(Math.random() * 2000); 
      const outpath : string = __dirname + "/tmp/filtered." + rndnum + ".jpg";
      Jimp.read(inputURL).then( (photo) => {
        photo
          .resize(256, 256) // resize
          .quality(60)      // set JPEG quality
          .greyscale()      // set greyscale
          .getBase64Async(Jimp.MIME_JPEG).then( input_base64 => 
          { 
            const erroutput : Promise<string | void> = filter(input_base64, outpath).then ( erroutput => {
              // Error handling if something bad happened in python 
              if (erroutput != "")
              {
                reject(erroutput.toString());
              }
              resolve(outpath);
            })
          });
      });

    } catch (error) {
      reject(error);
    }
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}
