import React from "react";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Dropdown, Tablesort } from "..";
import { useTranslation } from "react-i18next";

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

const button_theme = createTheme({
    palette: {
        primary: {
            main: "#F390B0",
            dark: "#FF99BA",
            contrastText: "#ffffff",
        },
    },
    typography: {
        fontFamily: ["Kanit", "sans-serif"].join(","),
        fontSize: 15,
    },
});

const dropdown_theme = createTheme({
    palette: {
        primary: {
            main: "#F390B0",
        },
    },
    typography: {
        fontFamily: ["Kanit", "sans-serif"].join(","),
    },
});

const DetailHotspot = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col space-y-4">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                <ThemeProvider theme={button_theme}>
                    <Button
                        variant="contained"
                        sx={{
                            height: "100%",
                            width: "100%",
                            minHeight: "50px",
                        }}
                        className="!capitalize"
                    >
                        {t("toggle_province_boundary")}
                    </Button>
                </ThemeProvider>
                <ThemeProvider theme={dropdown_theme}>
                    <Dropdown label={t("month")} items={months} />
                </ThemeProvider>
            </div>
            <div className="">
                <Tablesort height="620px" />
            </div>
        </div>
    );
};

export default DetailHotspot;
