import React from "react";
import { Map, Detail } from "../../components";

const Visual = () => {
    return (
        <div class="flex flex-col h-auto px-10 drop-shadow-xl space-y-10">
            <div class="flex flex-row justify-center">
                <div class="flex flex-col order-2 sm:flex-row">
                    <button class="font-kanit bg-[#F690B0] text-white font-light rounded-t-md sm:rounded-none sm:rounded-l-md px-5 py-2">
                        แสดงจุดความร้อน
                    </button>
                    <button class="font-kanit bg-[#d8d8d8] text-neutral-900 px-5 py-2 border-neutral-900 border-y md:border-y-transparent md:border-x">
                        แสดงประเภทพื้นที่เพาะปลูก
                    </button>
                    <button class="font-kanit bg-[#d8d8d8] text-neutral-900 rounded-b-md sm:rounded-none sm:rounded-r-md px-5 py-2">
                        แสดงทั้งหมด
                    </button>
                </div>
            </div>
            <div class="flex mb-4 flex-col md:flex-row bg-white rounded-lg">
                <div class="md:w-3/5 md:order-last">
                    <Map mapStyle="h-[calc(100vh-12rem)]" />
                </div>
                <div class="md:w-2/5 md:order-first p-4">
                    <Detail />
                </div>
            </div>
        </div>
    );
};

export default Visual;
