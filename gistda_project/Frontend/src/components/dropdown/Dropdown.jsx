import React from "react";
import { IoIosArrowDown } from "react-icons/io";

const Dropdown = ({ title, value }) => {
    return (
        <div class="relative border border-slate-400 rounded-md p-3 min-w-[135px] my-3">
            <div class="absolute -top-[0.8rem] left-3 bg-white px-2">
                <h1 class="font-kanit text-neutral-900">{title}</h1>
            </div>
            <div class="flex flex-row">
                <div class="flex-1">
                    <p class="font-kanit">{value[0]}</p>
                </div>
                <button class="">
                    <IoIosArrowDown />
                </button>
            </div>
        </div>
    );
};

export default Dropdown;
