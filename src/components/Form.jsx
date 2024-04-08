import { useState, useEffect } from "react";

function Form(props) {
  const [name, setName] = useState('');
  const [addition, setAddition] = useState(false); // to trigger geoFinMe after a task added
  useEffect(() => {
    if (addition) {
      console.log("useEffect detected addition");
      // props.geoFindMe();
      setAddition(false);
    }
  });

  // NOTE: As written, this function has a bug: it doesn't prevent the user
  // from submitting an empty form. This is left as an exercise for developers
  // working through MDN's React tutorial.
  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      return;
      }
      setAddition(true); 
    props.addTask(name);
    setName("");
  }

  function handleChange(event) {
    setName(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="label-wrapper">
        <label htmlFor="new-todo-input" className="label__lg">
          What new item would you like to add?
        </label>
      </h2>

      <input
        type="text"
        id="new-todo-input"
        className="input input__lg"
        name="text"
        autoComplete="off"
        value={name}
        onChange={handleChange}
      />
      <button type="submit" className="btn btn__primary btn__lg">
        Add
      </button>
    </form>
  );
}

export default Form;
