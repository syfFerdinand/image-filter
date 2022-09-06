import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

const isImageURL = require('image-url-validator').default;

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage",async (req,res)=> {
    let { image_url } = req.query;

    if(!image_url){
      return res.status(422)
                .send(`image_url is required !`);
    }
    
    const verifyFile = await isImageURL(image_url).then((is_image: any) => {
        //console.log(is_image);
        return is_image;
    });


    if(verifyFile == false){
      res.status(422).send(`the uri content-type is not image !`);
    }else{
      let imagePath = await filterImageFromURL(image_url);
      (await res.status(200).sendFile(imagePath, (error)=>{
          
          if(error){
            console.error(error);
          }else{
            deleteLocalFiles([imagePath]);
          }
      }));
    }

  
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();