import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Model = (props) => {
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // shit dont work
    try {
      const result = await axios.post('http://localhost:8000/chatgpt', {
        input
      });
      setResponse(result.data);
    } catch (error) {
      setResponse('An error occurred while processing your request.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="input">Input:</label>
        <input
          type="text"
          id="input"
          value={props.input}
          onChange={(e) => props.setInput(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <div>
        <h3>Response:</h3>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default Model;