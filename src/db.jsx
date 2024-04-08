import Dexie from "dexie"; // 1 Note install and imports.
import { useLiveQuery } from "dexie-react-hooks"; // 1 Note install and imports.

export const db = new Dexie("todo-photos"); // 2 The database is created here.

db.version(1).stores({ // 3 The table “photos” will contain just and id attribute.
 photos: "id", 
 // Primary key, don't index photos. 
 // Why? See https://dexie.org/docs/Version/Version.stores()#warning
 // Are you going to put your property in a where(‘…’) clause? If yes, index it, if not, dont. 
 //Large indexes will affect database performance and in extreme cases make it unstable.
});


// Specifying the persistent option when opening the database
db.open({
    persistent: true // Mark the database as persistent
  }).then(() => {
    console.log("Database opened successfully.");
  }).catch((error) => {
    console.error("Error opening database:", error);
  });

async function addPhoto(id, imgSrc) { // 4 To save a photo, the id will be passed as prop
    console.log("addPhoto", imgSrc.length, id);
    try {
            // Add the new photo with id used as key for todo array in localStorage
            // to avoid having a second pk for one todo item. 
            // 
            const existingPhoto = await db.photos.get(id);
            if (existingPhoto) {
                // Update the existing entry
                await db.photos.update(id, { imgSrc: imgSrc });
                console.log(`Photo with ID ${id} successfully updated.`);
            } else {
                // Add the new photo
                await db.photos.add({ id: id, imgSrc: imgSrc });
                console.log(`New photo with ID ${id} successfully added.`);
            } 
        } catch (error) {
            console.log(`Failed to add / update photo: ${error}`);
        }
        return (
            <> 
                <p>
                    {imgSrc.length} &nbsp; | &nbsp; {id}
                </p>
            </>
        );
    }


function GetPhotoSrc(id) {
    console.log("getPhotoSrc", id);
    const img = useLiveQuery(() => db.photos.where("id").equals(id).toArray());
    console.table(img);
    //if (Array.isArray(img)) return img[0].imgSrc; // 6 Return data string for image 
    //  function improved to return message rather than blank screen when no corresponding image is found
    if (Array.isArray(img) && img.length > 0) {
        return img[0].imgSrc; // Return the image source if found
      } else {
        return null; // Return null if no image is found
      }
    }
// identified by id. This function very ugly!
    // Opportunity to improve and gain marks!

export { addPhoto, GetPhotoSrc }; // 7 Note exports so other files can use these functions
   