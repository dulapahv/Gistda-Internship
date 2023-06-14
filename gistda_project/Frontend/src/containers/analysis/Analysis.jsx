import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Dropdown, Checkbox, Barchart } from "../../components";

const order_by = ["จำนวนจุด", "วันที่", "จังหวัด"];

const dropdown_theme = createTheme({
    palette: {
        primary: {
            main: "#F390B0",
            dark: "#FF99BA",
        },
    },
    typography: {
        fontFamily: ["Kanit", "sans-serif"].join(","),
    },
});

const checkbox_theme = createTheme({
    palette: {
        primary: {
            main: "#F390B0",
            dark: "#FF99BA",
        },
    },
    typography: {
        fontFamily: ["Kanit", "sans-serif"].join(","),
    },
});

const Analysis = () => {
    return (
        <div className="flex flex-col h-auto px-10 drop-shadow-xl space-y-10">
            <div className="mb-4 md:flex-row bg-white rounded-lg p-4 space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-flow-row">
                    <ThemeProvider theme={dropdown_theme}>
                        <Dropdown label="ช่วงวันที่" items={order_by} />
                        <Dropdown label="จังหวัด" items={order_by} />
                        <Dropdown label="เขต/อำเภอ" items={order_by} />
                        <Dropdown label="แขวง/ตำบล" items={order_by} />
                    </ThemeProvider>
                </div>
                <div className="flex flex-col md:flex-row space-x-0 md:space-x-4">
                    <div className="flex flex-col justify-center">
                        <p className="font-kanit">แสดงประเภทพืช</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                        <ThemeProvider theme={checkbox_theme}>
                            <Checkbox label="ข้าว" />
                            <Checkbox label="ข้าวโพด" />
                            <Checkbox label="อ้อย" />
                            <Checkbox label="มันสำปะหลัง" />
                        </ThemeProvider>
                    </div>
                </div>
                <div>
                    <Barchart />
                </div>
            </div>
        </div>
    );
};

export default Analysis;
