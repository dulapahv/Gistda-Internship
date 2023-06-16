// import axios from 'axios';
import React from "react";

import { Header } from "./components";
import { Analysis, Banner, Footer, Visual } from "./containers";

// const baseURL = 'http://localhost:3000/';

function App() {
  // const [posts, setPosts] = useState([]);

  // useEffect(() => {
  //   fetchPosts();
  // }, []);

  // const fetchPosts = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${baseURL}?data=hotspot_202303&select=objectid,latitude,longitude,pv_tn&where=objectid%3C%3D100&order_by=acq_date&order=desc&limit=5`
  //     );
  //     setPosts(response.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // if (!posts) {
  //   return <div>No data</div>;
  // }

  return (
    <div className="flex flex-col w-full">
      <Banner />
      <div className="px-5 sm:px-10">
        <Header text="main_title" />
        <Visual />
        <Header text="analysisTitle" />
        <Analysis />
      </div>
      <Footer />
      {/* <div>
        <input type="text" id="user_query" className="w-screen bg-red-300" />
        <button
          onClick={async () => {
            try {
              const response = await axios.get(
                `${baseURL}?${document.getElementById("user_query").value}`
              );
              setPosts(response.data);
            } catch (error) {
              console.log(error);
            }
          }}
          className="bg-red-200"
        >
          Search
        </button>
      </div>
      <div>
        {Object.keys(posts).map((key) => {
          return posts[key].map((item) => (
            <div key={item.objectid}>
              <p>{item.objectid}</p>
              <p>{item.latitude}</p>
              <p>{item.longitude}</p>
              <p>{item.pv_tn}</p>
            </div>
          ));
        })}
      </div> */}
    </div>
  );
}

export default App;
