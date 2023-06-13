import React from "react";
import { Dropdown } from "../";

const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
];

const order_by = ["จำนวนจุด", "วันที่", "จังหวัด"];

const Detail = () => {
    return (
        <div class="flex flex-col">
            <div class="flex flex-row space-x-4 flex-wrap items-center justify-center sm:justify-start">
                <button class="font-kanit text-white font-light bg-[#f090b0] rounded-md p-3 h-fit">
                    เปิดชั้นข้อมูลขอบเขตจังหวัด
                </button>
                <div>
                    <Dropdown title="เดือน" value={months} />
                </div>
                <div>
                    <Dropdown title="เรียงตาม" value={order_by} />
                </div>
            </div>
            <div></div>
        </div>
    );
};

export default Detail;
