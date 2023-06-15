import React from "react";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Dropdown } from "..";
import { useTranslation } from "react-i18next";

const date_range = [
    "2023/03/01 - 2023/03/31",
    "2023/04/01 - 2023/04/31",
    "2023/05/01 - 2023/05/31",
];

const agri_type = ["crop.rice", "crop.maize", "crop.sugarcane", "crop.cassava"];

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

const DetailAll = () => {
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
                    <Dropdown label={t("date_range")} items={date_range} />
                    <Dropdown label={t("crop_type")} items={agri_type} />
                </ThemeProvider>
            </div>
            {/* <div className="">
                <Tablesort />
            </div> */}
        </div>
    );
};

export default DetailAll;
