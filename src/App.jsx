import React, { useState, useRef, useEffect, useCallback } from "react";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import Todo from "./components/Todo";
import WebcamCapture from "./components/WebcamCapture";
import { nanoid } from "nanoid";
import './index.css';


// Custom hook to track the previous value
function usePrevious(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// Filter mapping for different task states
const FILTER_MAP = {
  All: () => true,
  Unavailable: (task) => !task.completed,
  Available: (task) => task.completed,
};

// Default last inserted ID and filter names
const DEFAULT_LAST_INSERTED_ID = "default-id";
const FILTER_NAMES = Object.keys(FILTER_MAP);

function App(props) {
  // State for last inserted ID
  const [lastInsertedId, setLastInsertedId] = useState(DEFAULT_LAST_INSERTED_ID);
  // State for nearest cafe
  const [nearestCafe, setNearestCafe] = useState(null);
  // State for permission to geolocate
  const [permissionGranted, setPermissionGranted] = useSessionStorageState('geolocationPermissionGranted', false);
  // State to track whether the first item has been added during the session
  const [firstItemAddedDuringSession, setFirstItemAddedDuringSession] = useState(false);
  // Define the state variable to track whether the "Wrong cafe?" button should be visible
  const [showWrongCafeButton, setShowWrongCafeButton] = useState(true);
  //Count tasks to make Wrong Cafe? disappear after the first 2 session inputs
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    if (permissionGranted) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          console.log(latitude, longitude);
          const nearest = calculateNearestCafe(latitude, longitude);
          setNearestCafe(nearest);
        },
        (error) => {
          console.error("Error retrieving location:", error);
        }
      );
    }
  }, [permissionGranted]);
 
  useEffect(() => {
    setTasks(prevTasks => {
      const updatedTasks = replaceNullBranchWithNearestCafe(prevTasks);
      return updatedTasks;
    });
  }, [nearestCafe]);
  
  const getLocation = () => {
    if (permissionGranted) {
      return;
    }
    const confirmation = window.confirm("This app would like to use your location to determine the cafe you are in. Do you agree to this?");
    if (confirmation) {
      setPermissionGranted(true);
    } else {
      console.log("User denied geolocation permission");
    }
  };

  // Function to calculate distance between two points using the Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
  
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const d = R * c; // Distance in meters
    return d;
  };
  
  // Function to determine the nearest cafe based on user's location
  const calculateNearestCafe = (latitude, longitude) => {
    // Coordinates of Alva and London cafes
    const alvaLatitude = 56.15055;
    const alvaLongitude = 3.79076;
    const londonLatitude = 51.5074;
    const londonLongitude = -0.1278;

    // Calculate distances to both cafes
    const distanceToAlva = calculateDistance(latitude, longitude, alvaLatitude, alvaLongitude);
    const distanceToLondon = calculateDistance(latitude, longitude, londonLatitude, londonLongitude);

    // Determine the nearest cafe
    if (distanceToAlva < distanceToLondon) {
      return "Alva";
    } else {
      return "London";
    }
  };

  // Handle "Wrong Cafe?" button click
  function handleWrongCafe() {
    const confirmation = window.confirm("Are you sure you're not at the correct cafe?");
    if (confirmation) {
      const selectedCafe = prompt("Enter the correct cafe branch (London or Alva):");
      if (selectedCafe && (selectedCafe === "London" || selectedCafe === "Alva")) {
        setNearestCafe(selectedCafe);
        // If the first item hasn't been added during the session yet, update its branch
        if (!firstItemAddedDuringSession) {
          setFirstItemAddedDuringSession(true);
          setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task => {
              if (task.id === lastInsertedId) {
                // Update the branch of the first item
                return { ...task, branch: selectedCafe };
              }
              return task;
            });
            return updatedTasks;
          });
        }
      } else {
        alert("Please enter a valid cafe branch (London or Alva).");
      }
    }
}
  // Custom hook to manage persisted state with localStorage
  function usePersistedState(key, defaultValue) {
    const [state, setState] = useState(() => {
      const persistedState = JSON.parse(localStorage.getItem(key));
      return persistedState !== null ? persistedState : defaultValue;
    });
    
    useEffect(() => {
      try {
          localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
          console.error("Error saving data:", error);
        }
    }, [key, state]);
    
  return [state, setState];
  }

  // State for tasks, persisted in localStorage
  const [tasks, setTasks] = usePersistedState('tasks', []);
  const [filter, setFilter] = React.useState("All");

  // Toggle availability status of a product
  function toggleTaskCompleted(id) {
    getLocation(); 
    const updatedTasks = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // use object spread to make a new object
        // whose `completed` prop has been inverted
        return { ...task, completed: !task.completed };
      } else {
        // Return the task unchanged
        return task;
      }
  return task;
  });
  setTasks(updatedTasks);
  }

  // Delete a task
  function deleteTask(id) {  
    const remainingTasks = tasks.filter((task) => id !== task.id);
    setTasks(remainingTasks);
  }

  // Edit a task
  function editTask(id, newName) {
    getLocation(); 
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

  // Update location of a task
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

  // List of tasks based on selected filter
  const taskList = tasks?.filter(FILTER_MAP[filter]).map((task) => (
      <Todo
        id={task.id}
        name={task.name}
        completed={task.completed}
        branch={task.branch}
        key={task.id}   
        location={task.location} 
        toggleTaskCompleted={toggleTaskCompleted}
        photoedTask={photoedTask} 
        deleteTask={deleteTask}
        editTask={editTask}
      />
    ));

  // List of filter buttons
  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  // Function to handle persistence
  async function handlePersistence() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        if (!isPersisted) {
          console.log("Storage is not persisted :( ");
          console.log("Trying to persist..:");
          const persistenceResult = await navigator.storage.persist();
          if (persistenceResult) {
            console.log("Storage changed to be persisted :)");
          } else {
            console.log("Failed to make storage persisted :( ");
          }
        } else {
          console.log("Storage is already persisted :) ");
        }
      } else {
        console.log("Storage persistence is not supported");
      }
    } catch (error) {
      console.error("Error occurred while attempting to persist storage:", error);
      throw error;
    }
  }

  function useSessionStorageState(key, defaultValue) {
    const [state, setState] = useState(() => {
      const storedValue = sessionStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    });
  
    useEffect(() => {
      sessionStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
  
    return [state, setState];
  }

  // Function to add a new task
  function addTask(name) {

    // Invoke geolocation to ensure correct cafe has items added
    getLocation(); 

    const id = "todo-" + nanoid();
    const newTask = {
      id: id,
      name: name,
      completed: true,
      branch: nearestCafe,
    };

    // Update the tasks state with the new task
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      // This will automatically update local storage due to the useEffect in usePersistedState
      return updatedTasks;
    });
  
    setTaskCount(count => count + 1);

    // Set the lastInsertedId to the id of the newly added task
    setLastInsertedId(id);

    if (taskCount === 2) {
      setFirstItemAddedDuringSession(true);
    }
  }  

  // Function to replace null values in branch attribute with nearestCafe
  function replaceNullBranchWithNearestCafe(tasks) {
    return tasks.map(task => {
      if (task.branch === null || task.branch === undefined) {
        return { ...task, branch: nearestCafe !== null ? nearestCafe : "nearestCafe" };
      }
      return task;
    });
  }
  
  // Determine whether to display "item" or "items" based on the number of tasks
  const tasksNoun = taskList.length !== 1 ? "items" : "item";

  // Generate the heading text using the count of tasks and the noun
  const headingText = `${taskList.length} ${tasksNoun} `;

  // Create a reference to the list heading element
  const listHeadingRef = useRef(null);

  // Track the length of tasks in the previous render
  const prevTaskLength = usePrevious(tasks.length);

  // Use an effect to focus on the list heading when tasks are removed
  useEffect(() => {
    if (tasks.length < prevTaskLength) {
      listHeadingRef.current.focus();
    }
  }, [tasks.length, prevTaskLength]);

  // Return the JSX representing the application
  return (
    <div>
      <main className="todoapp stack-large">
        <h1>Academy Cafe</h1>
        <div style={{ textAlign: 'center' }}>
          <img src="public/images/cafeLogoNoText192.png" alt="Cafe Logo" style={{ width: '20vw', height: 'auto', margin:'0 0 0 0' }} />
        </div>
        {nearestCafe && (
          <section>
            <span style={{ 
              backgroundColor: nearestCafe === "Alva" ? "#e6f7ff" : nearestCafe === "London" ? "#f0f9eb" : "", 
              fontSize: nearestCafe === "London" ? "1.6em" : "1.6em", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              height: "100%",
              padding: "10px 0px 10px 0px", }}>
            {nearestCafe}
          </span>
          {showWrongCafeButton && taskCount <= 1 && (
            <button onClick={handleWrongCafe} 
              style={{
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "100%",
                fontSize: "0.9em",
                width: "100%", 
                border: "none", 
                background: "none", 
                cursor: "pointer", 
                padding: "0", 
                marginTop: "6px",
              }}>
              Wrong Cafe?
            </button>
          )}
          </section>
        )}
        <Form addTask={addTask} />
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
      </main>
      <footer style={{ backgroundColor: "#555", color: "white", textAlign: "center", padding: "40px 0px  40px 0px" }}>
        smsoftware
      </footer>
  </div>
  );

  function photoedTask(id) {
    console.log("photoedTask", id);
    const photoedTaskList = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // Photo property set to true for a task identified by id when a photo for that
        // task is saved.
          return { ...task, photo: true };
        }
        return task;
      });
      console.log(photoedTaskList);
      // List appended with the accompanying photo.
      setTasks(photoedTaskList); 
  }    
}

export default App;
