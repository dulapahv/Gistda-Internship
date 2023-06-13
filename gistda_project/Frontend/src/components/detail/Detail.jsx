import React from "react";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
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

const button_theme = createTheme({
    palette: {
        primary: {
            main: "#F390B0",
            dark: "#FF9AAE",
            contrastText: "#ffffff",
        },
    },
    typography: {
        fontFamily: ["Kanit", "sans-serif"].join(","),
    },
});

const dropdown_theme = createTheme({
    palette: {
        primary: {
            main: "#F390B0",
            dark: "#FF9AAE",
        },
    },
    typography: {
        fontFamily: ["Kanit", "sans-serif"].join(","),
    },
});

const Detail = () => {
    return (
        <div className="flex flex-col">
            <div className="flex flex-row space-x-4 space-y-4 flex-wrap items-center justify-center sm:justify-start">
                <ThemeProvider theme={button_theme}>
                    <Button variant="contained" style={{ minHeight: "50px" }}>
                        เปิดชั้นข้อมูลขอบเขตจังหวัด
                    </Button>
                </ThemeProvider>
                <ThemeProvider theme={dropdown_theme}>
                    <Dropdown label="เดือน" items={months} />
                    <Dropdown label="เรียงตาม" items={order_by} />
                </ThemeProvider>
            </div>
            <div className="flex flex-col">
                <div className="flex flex-row"></div>
            </div>
        </div>
    );
};

export default Detail;
