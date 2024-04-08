import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { addPhoto } from "../db.jsx"; 



const WebcamCapture = (props) => {
    //  1 Prepare the Hooks
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [imgId, setImgId] = useState(null);
    const [photoSave, setPhotoSave] = useState(false);
    const [showWebcam, setShowWebcam] = useState(true);
    // 2 When photo save detected, call photoedTask in App.js to update task
   // in localStorage to indicate it has a photo.
    
   useEffect(() => {
        if (photoSave) {
            console.log("useEffect detected photoSave");
            props.photoSavedCallback(); // Notify parent component to close the popup
            props.photoedTask(imgId);
            setPhotoSave(false);
            setShowWebcam(false);
            setImgSrc(null);
            // setImgId(null);
        }
    }, [photoSave, props]);

    // The callback function saved in the const capture.

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
            setShowWebcam(false);
            console.log("capture", imageSrc.length, props.id);
            console.log("Resolution:", webcamRef.current.video.videoWidth, "x", webcamRef.current.video.videoHeight);
        }
        }, [webcamRef, setImgSrc, setShowWebcam]);
        
    //  The savePhoto function 
    const savePhoto = useCallback(() => {
        console.log("savePhoto", imgSrc.length);
       
        if (imgSrc) {
            addPhoto(props.id, imgSrc);
            //setImgId(id);
            setPhotoSave(true);
            setShowWebcam(true);
        }
    }, [props.id, imgSrc]);
  
    const cancelPhoto = () => {
        // Clear the captured image source and image ID by setting to null
        setImgSrc(null);
        setShowWebcam(true);
    };
    
    return (
        <>
            {!photoSave && (
                <div className="webcam-container" style={{ width: '100%', maxHeight: '100%', overflow: 'hidden' }}>
                    {showWebcam && (
                        <Webcam 
                            audio={false} 
                            ref={webcamRef} 
                            screenshotFormat="image/jpeg" 
                            style={{maxWidth: '100%', height: 'auto'}}
                            width={320}
                            height={240}
                        />
                  
                    )}
                    {imgSrc && (
                        <img 
                            src={imgSrc}
                            alt="Captured"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    )} 
                    
                    {/* Before image capture show capture button &functionality */}
                    {!photoSave && (
                    <div className="btn-group">
                        {!imgSrc && showWebcam && ( 
                            <button
                                type="button"
                                className="btn"
                                onClick = {capture}
                            >
                                Capture photo
                            </button>
                        )}
                        {/* After image capture show save button & functionality */}
                        {imgSrc && ( 
                            <button
                                type="button"
                                className="btn"
                                onClick={() => savePhoto(props.id, imgSrc)}
                            >
                                Save Photo
                            </button>
                        )}
                        {/* Cancel button fixed */}
                        {imgSrc && ( 
                        <button 
                            type="button"
                            className="btn todo-cancel"
                            onClick = {cancelPhoto}
                        >
                            Retake
                        </button>
                        )}
                    </div>  
                    )}    
                </div>
            )}
        </>
    );
    
};

export default WebcamCapture;