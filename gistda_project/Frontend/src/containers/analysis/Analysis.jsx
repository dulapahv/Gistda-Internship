import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Dropdown, Checkbox, Barchart } from "../../components";
import { useTranslation } from "react-i18next";

const date_range = [
    "2023/03/01 - 2023/03/31",
    "2023/04/01 - 2023/04/31",
    "2023/05/01 - 2023/05/31",
];

const agri_type = ["crop.rice", "crop.maize", "crop.sugarcane", "crop.cassava"];

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

const checkbox_theme = createTheme({
    palette: {
        primary: {
            main: "#F390B0",
        },
    },
    typography: {
        fontFamily: ["Kanit", "sans-serif"].join(","),
    },
});

const Analysis = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-auto drop-shadow-xl space-y-10">
            <div className="mb-4 md:flex-row bg-white rounded-lg p-4 space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                    <ThemeProvider theme={dropdown_theme}>
                        <Dropdown label={t("date_range")} items={date_range} />
                        <Dropdown label={t("province")} items={date_range} />
                        <Dropdown label={t("district")} items={date_range} />
                        <Dropdown
                            label={t("sub_district")}
                            items={date_range}
                        />
                    </ThemeProvider>
                </div>
                <div className="flex flex-col md:flex-row space-x-0 md:space-x-8">
                    <div className="flex flex-col justify-center">
                        <p className="font-kanit">{t("display_crop_type")}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                        <ThemeProvider theme={checkbox_theme}>
                            <Checkbox label={agri_type[0]} />
                            <Checkbox label={agri_type[1]} />
                            <Checkbox label={agri_type[2]} />
                            <Checkbox label={agri_type[3]} />
                        </ThemeProvider>
                    </div>
                </div>
                <div className="flex justify-center">
                    <div className="w-full md:w-9/12 max-w-screen-2xl">
                        <Barchart />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
