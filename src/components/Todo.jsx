import { useEffect, useRef, useState, useCallback } from "react";
import Popup from "reactjs-popup"; // For our popups
import "reactjs-popup/dist/index.css"; // For the popups to look nicer.
import Webcam from "react-webcam"; // For using react-webcam
import WebcamCapture from "./WebcamCapture";
import { addPhoto, GetPhotoSrc } from "../db.jsx";

function usePrevious(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const ViewPhoto = (props) => {
  // 1 Retrieving photo by id from IndexedDB using GetPhotoSrc in db.js.
  const photoSrc = GetPhotoSrc(props.id);
  return (
      <div>
        {/* 2 Render image tag with src attribute set to data URL retrieved from IndexedDB */}
        {/* <img src={photoSrc} alt={props.name} /> */}

        {/* Conditional rendering to display a message if no photo is found */}
        {photoSrc ? (
          <img src={photoSrc} alt={props.name} />
        ) : (
          <p>No image added for this product</p>
        )}
      </div>
  );
 };

 const PopupWithCloseIcon = ({ children, onClose }) => (
  <div className="popup-container">
    <span className="close-icon" onClick={onClose}>X</span>
    {children}
  </div>
);

function Todo(props) {
  const [isEditing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const editFieldRef = useRef(null);
  const editButtonRef = useRef(null);

  // Added Sunday to try to handle closing of pop up from Take Photo
  const wasEditing = usePrevious(isEditing);
  const [isPopupOpen, setPopupOpen] = useState(false); // State for Popup visibility

  // End of Sunday addition

  const handleTakePhotoClick = () => {
    setPopupOpen(true);
  };

  const handlePhotoSaved = () => {
    // Close the Popup after the photo is saved
    setPopupOpen(false);
  };

  function handleChange(event) {
    setNewName(event.target.value);
  }

  // Empty form bug corrected.
  function handleSubmit(event) {
    event.preventDefault();
    props.editTask(props.id, newName);
    setNewName("");
    setEditing(false);
  }

  const editingTemplate = (
    <form className="stack-small" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="todo-label" htmlFor={props.id}>
          {props.name}
          {props.location && props.location.latitude && (
          <span>&nbsp;| la {props.location.latitude}</span>
          )}
          {props.location && props.location.longitude && (
            <span>&nbsp;| lo {props.location.longitude}</span>
          )}

        </label>
        <input
          id={props.id}
          className="todo-text"
          type="text"
          value={newName}
          onChange={handleChange}
          ref={editFieldRef}
        />
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn todo-cancel"
          onClick={() => setEditing(false)}>
          Cancel
          <span className="visually-hidden">renaming {props.name}</span>
        </button>
        <button type="submit" className="btn btn__primary todo-edit">
          Save
          <span className="visually-hidden">new name for {props.name}</span>
        </button>
      </div>
    </form>
  );

  const viewTemplate = (
    <div className="stack-small">
      <div className="c-cb">
        <input
          id={props.id}
          type="checkbox"
          defaultChecked={props.completed}
          onChange={() => props.toggleTaskCompleted(props.id)}
        />
        <label className="todo-label" htmlFor={props.id}>
          {props.name} - 
          <span style={{ 
              backgroundColor: props.branch === "Alva" ? "#e6f7ff" : props.branch === "London" ? "#f0f9eb" : "",
              padding: "2px 8px", 
              marginLeft: "5px"
            }}>
            {props.branch}          
          </span>
        </label>


      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditing(true);
          }}
          ref={editButtonRef}>
          Edit <span className="visually-hidden">{props.name}</span>
        </button>

        <button
          type="button"
          className="btn"
          onClick={handleTakePhotoClick} 
        >
          Take Photo
        </button>

        <Popup
          open={isPopupOpen}
          closeOnDocumentClick={false}
          onClose={() => setPopupOpen(false)}
          contentStyle={{ maxWidth: "600px" }}
          modal
        >
          {(close) => (
            <PopupWithCloseIcon onClose={() => {
              setPopupOpen(false);
              close();
            }}>
          
            <WebcamCapture
              id={props.id}
              photoedTask={props.photoedTask}
              photoSavedCallback={() => {
                handlePhotoSaved();
                close();
              }}
            />
          </PopupWithCloseIcon>
        )}
      </Popup>
        <Popup
          trigger={
            <button type="button" className="btn">
              {" "}
              View Photo{" "}
            </button>
          }
          modal
          >
          {(close) => (
            <PopupWithCloseIcon onClose={close}>
              <ViewPhoto id={props.id} alt={props.name} />
            </PopupWithCloseIcon>
          )}
        </Popup>

        <button
          type="button"
          className="btn btn__danger"
          onClick={() => props.deleteTask(props.id)}>
          Delete <span className="visually-hidden">{props.name}</span>
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    if (!wasEditing && isEditing) {
      editFieldRef.current.focus();
    } else if (wasEditing && !isEditing) {
      editButtonRef.current.focus();
    }
  }, [wasEditing, isEditing]);

  return <li className="todo">{isEditing ? editingTemplate : viewTemplate}</li>;
}

export default Todo;
