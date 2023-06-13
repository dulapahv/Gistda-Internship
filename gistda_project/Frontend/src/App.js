import axios from "axios";
import React, { useEffect, useState } from "react";
import { Banner, Footer, Visual, Analysis } from "./containers";
import { Header } from "./components";

const baseURL = "http://localhost:3000/";

function App() {
    const [posts, setPosts] = useState([]);

    // useEffect(() => {
    //     fetchPosts();
    // }, []);

    // const fetchPosts = async () => {
    //     try {
    //         const response = await axios.get(
    //             `${baseURL}?data=hotspot_202303&select=objectid,latitude,longitude,pv_tn&where=objectid%3C%3D100&order_by=acq_date&order=desc&limit=5`
    //         );
    //         setPosts(response.data);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    // if (!posts) {
    //     return <div>No data</div>;
    // }

    return (
        <div className="flex flex-col w-full">
            <Banner />
            <Header
                text={
                    <span>
                        ระบบติดตามจุดความร้อน ประเภทพื้นที่เพาะปลูก
                        และผลกระทบที่มีต่อการเพาะปลูกพืชเศรษฐกิจของประเทศไทย
                        <br />
                        จากเทคโนโลยีดาวเทียมและภูมิสารสนเทศ
                    </span>
                }
            />
            <Visual />
            <Header text="วิเคราะห์ผลกระทบจากจุดความร้อน" />
            <Analysis />
            <Footer />
            {/* <div>
                <input
                    type="text"
                    id="user_query"
                    className="w-screen bg-red-300"
                />
                <button
                    onClick={async () => {
                        try {
                            const response = await axios.get(
                                `${baseURL}?${
                                    document.getElementById("user_query").value
                                }`
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
