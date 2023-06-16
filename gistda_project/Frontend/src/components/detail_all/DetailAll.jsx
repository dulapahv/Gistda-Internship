import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Dropdown } from "..";

const dateRange = [
    "2023/03/01 - 2023/03/31",
    "2023/04/01 - 2023/04/31",
    "2023/05/01 - 2023/05/31",
];

const agriType = ["crop.rice", "crop.maize", "crop.sugarcane", "crop.cassava"];

const buttonTheme = createTheme({
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

const dropdownTheme = createTheme({
    palette: {
        primary: {
            main: "#F390B0",
        },
    },
    typography: {
        fontFamily: ["Kanit", "sans-serif"].join(","),
    },
});

function DetailAll() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col space-y-4">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                <ThemeProvider theme={buttonTheme}>
                    <Button
                        variant="contained"
                        sx={{
                            height: "100%",
                            width: "100%",
                            minHeight: "50px",
                        }}
                        className="!capitalize"
                    >
                        {t("toggleProvinceBoundary")}
                    </Button>
                </ThemeProvider>
                <ThemeProvider theme={dropdownTheme}>
                    <Dropdown label={t("dateRange")} items={dateRange} />
                    <Dropdown label={t("cropType")} items={agriType} />
                </ThemeProvider>
            </div>
            {/* <div className="">
                <Tablesort />
            </div> */}
        </div>
    );
}

export default DetailAll;
