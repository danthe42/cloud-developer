import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { spawn } from 'child_process';

function validateUrl(str: string) {
  return new URL(str);
}

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );

  app.get( "/filteredimage", async ( req, res ) => {
    const https = require('https');
    const imgname = req.query["image_url"];

    if (!imgname || imgname == "") {
      return res.status(400).send("You must specify an image_url.");
    }

    if (!validateUrl(imgname)) {
      return res.status(400).send("Invalid URI in image_url");
    }

    filterImageFromURL( imgname ).then( (fname) => {
      console.log("Output filename: " + fname)
      res.sendFile ( fname );  

      // cleanup. This event is fired: "Emitted when the request has been sent. More specifically, this event is emitted when the last segment of the response headers and body have been handed off to the operating system for transmission over the network. It does not imply that the server has received anything yet."     
      res.on( "finish", function() {
        deleteLocalFiles( [ fname ] );
      } );
      
    } ).catch( (errmsg) => {
      return res.status(400).send(errmsg.toString());
    } ); 
  } );

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();