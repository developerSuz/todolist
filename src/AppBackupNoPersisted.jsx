import React, { useState, useRef, useEffect, useCallback } from "react";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import Todo from "./components/Todo";
import WebcamCapture from "./components/WebcamCapture";
import { nanoid } from "nanoid";

function usePrevious(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const FILTER_MAP = {
  All: () => true,
  Unavailable: (task) => !task.completed,
  Available: (task) => task.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

function App(props) {

  const [lastInsertedId, setLastInsertedId] = useState(null);
  const geoFindMe = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
    } else {
      const confirmation=window.confirm("This app would like to use your location to pick the branch for you to save your time.  Do you agreeto this?");
      console.log("Locating…");
      navigator.geolocation.getCurrentPosition(success, error);
    }
    };

    const success = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log(latitude, longitude);
      console.log(`Latitude: ${latitude}°, Longitude: ${longitude}°`);
      console.log(`Try here: https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`);
      locateTask(lastInsertedId, {
        latitude: latitude,
        longitude: longitude,
        error: "",
      });
    };

    const error = () => {
    console.log("Unable to retrieve your location");
    };

    
    function usePersistedState(key, defaultValue){
      console.log("Key being retrieved:", key);
      console.log("DefaultValue passed in:", defaultValue);
      const [state, setState] = useState(() => JSON.parse(localStorage.getItem(key)) || defaultValue);

      useEffect(() => {
        //the function to be executed.
        try {
        console.log("Saving tasks to localStorage:", tasks);
        localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
          console.error("Error saving data:", error); // Log any errors that occur during data storage
        }
        }, [key, state]);
        return[state, setState];
      }

  const [tasks, setTasks] = usePersistedState('tasks', []);
  //const [tasks, setTasks] = useState(props.tasks);
  const [filter, setFilter] = useState("All");

  function toggleTaskCompleted(id) {
    const updatedTasks = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // use object spread to make a new obkect
        // whose `completed` prop has been inverted
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function deleteTask(id) {
    const remainingTasks = tasks.filter((task) => id !== task.id);
    setTasks(remainingTasks);
  }

  function editTask(id, newName) {
    const editedTaskList = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // Copy the task and update its name
        return { ...task, name: newName };
      }
      // Return the original task if it's not the edited task
      return task;
    });
    setTasks(editedTaskList);
  }

  function locateTask(id, location) {
    console.log("locate Task", id, " before");
    console.log(location, tasks);
    const locatedTaskList = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // Copy the task and update its name
        return { ...task, location: location };
      }
      // Return the original task if it's not the edited task
      return task;
    });
    console.log(locatedTaskList);
    setTasks(locatedTaskList);
  }


  const taskList = tasks?.filter(FILTER_MAP[filter]).map((task) => (
      <Todo
        id={task.id}
        name={task.name}
        completed={task.completed}
        key={task.id}
        /* latitude={task.location ? task.location.latitude : ''}
        longitude={task.location ? task.location.longitude: ''}
        toggleTaskCompleted={toggleTaskCompleted} */
        location={task.location} // 1 change compared with previous lab (geolocation).
        toggleTaskCompleted={toggleTaskCompleted}
        photoedTask={photoedTask} // 2 Set photoedTask function to props in Todo.js
        deleteTask={deleteTask}
        editTask={editTask}
      />
    ));


  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  // function addTask(name) {
  //   const newTask = { id: "todo-" + nanoid(), name: name, completed: false };
  //   setTasks([...tasks, newTask]);
  // }

  function addTask(name) {
    const id = "todo-" + nanoid();
    const newTask = {
    id: id,
    name: name,
    completed: false,
    location: { latitude: "##", longitude: "##", error: "##" },
    };
    setLastInsertedId(id);
    setTasks([...tasks, newTask]);
  }
   

  const tasksNoun = taskList.length !== 1 ? "items" : "item";
  const headingText = `${taskList.length} ${tasksNoun} `;

  const listHeadingRef = useRef(null);
  const prevTaskLength = usePrevious(tasks.length);

  useEffect(() => {
    if (tasks.length < prevTaskLength) {
      listHeadingRef.current.focus();
    }
  }, [tasks.length, prevTaskLength]);

  return (
    <div className="todoapp stack-large">
      <h1>Academy Cafe</h1>
      <Form addTask={addTask} geoFindMe={geoFindMe} />{" "}
      <div className="filters btn-group stack-exception">{filterList}</div>
      <h2 id="list-heading" tabIndex="-1" ref={listHeadingRef}>
        {headingText}
      </h2>
      <ul
        aria-labelledby="list-heading"
        className="todo-list stack-large stack-exception"
        role="list"
      >
        {taskList}
      </ul>
    </div>
  );

  function photoedTask(id) {
    console.log("photoedTask", id);
    const photoedTaskList = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // 1 Set photo property to true for a task identified by id when a photo for that
        // task is saved.
          return { ...task, photo: true };
        }
        return task;
      });
      console.log(photoedTaskList);
      setTasks(photoedTaskList); // 2  Update your tasks list appending the task with photo.
     }    
  }

export default App;
