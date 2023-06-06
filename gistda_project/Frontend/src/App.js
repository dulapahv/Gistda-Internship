import React, { useState } from "react";

function App() {
    const [query, setQuery] = useState("");
    const [data, setData] = useState([]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(
                `http://localhost:3000/?query=${query}`
            );
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Enter SQL query:
                    <input
                        type="text"
                        style={{ width: "500px", background: "#f2f2f2" }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </label>
                <button type="submit">Execute</button>
            </form>
            <div>
                <h1>Result:</h1>
                <ul>
                    {data.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
