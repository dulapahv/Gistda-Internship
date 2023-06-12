import React from "react";
import { Map, Detail } from "../../components";

const Visual = () => {
    return (
        <div className="flex flex-col h-auto px-10 drop-shadow-xl space-y-10">
            <div className="flex flex-row justify-center">
                <div className="flex flex-col order-2 sm:flex-row">
                    <button className="font-kanit bg-[#F690B0] text-white font-light rounded-t-lg sm:rounded-none sm:rounded-l-lg px-5 py-2">
                        แสดงจุดความร้อน
                    </button>
                    <button className="font-kanit bg-[#d8d8d8] px-5 py-2">
                        แสดงประเภทพื้นที่เพาะปลูก
                    </button>
                    <button className="font-kanit bg-[#d8d8d8] rounded-b-lg sm:rounded-none sm:rounded-r-lg px-5 py-2">
                        แสดงทั้งหมด
                    </button>
                </div>
            </div>
            <div className="md:flex bg-white rounded">
                <div className="flex-1 md:order-last">
                    <Map />
                </div>
                <div className="flex-none w-48 max-w-sm md:order-first">
                    <Detail />
                </div>
            </div>
        </div>
    );
};

export default Visual;
