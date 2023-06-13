import React from "react";
import { Dropdown, Barchart } from "../../components";

const order_by = ["จำนวนจุด", "วันที่", "จังหวัด"];

const Analysis = () => {
    return (
        <div className="flex flex-col h-auto px-10 drop-shadow-xl space-y-10">
            <div className="mb-4 md:flex-row bg-white rounded-lg p-4">
                <div className="flex flex-row flex-wrap space-x-5 justify-center md:justify-start">
                    <Dropdown label="ช่วงวันที่" items={order_by} />
                    <Dropdown label="จังหวัด" items={order_by} />
                    <Dropdown label="เขต/อำเภอ" items={order_by} />
                    <Dropdown label="แขวง/ตำบล" items={order_by} />
                </div>
                <div className="flex flew-row flex-wrap space-x-5 justify-center md:justify-start">
                    <div></div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
