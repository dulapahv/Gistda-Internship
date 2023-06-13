import React from "react";
import { Map, Detail } from "../../components";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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

const Visual = () => {
    const [alignment, setAlignment] = React.useState("left");

    const handleAlignment = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    return (
        <div className="flex flex-col h-auto px-10 drop-shadow-xl space-y-10">
            <div className="flex flex-row justify-center">
                <div className="flex flex-col order-2 sm:flex-row">
                    <ThemeProvider theme={button_theme}>
                        <ToggleButtonGroup
                            color="primary"
                            value={alignment}
                            exclusive
                            onChange={handleAlignment}
                            aria-label="text alignment"
                        >
                            <ToggleButton
                                value="left"
                                aria-label="left aligned"
                            >
                                แสดงจุดความร้อน
                            </ToggleButton>
                            <ToggleButton value="center" aria-label="centered">
                                แสดงประเภทพื้นที่เพาะปลูก
                            </ToggleButton>
                            <ToggleButton
                                value="right"
                                aria-label="right aligned"
                            >
                                แสดงทั้งหมด
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </ThemeProvider>
                </div>
            </div>
            <div className="flex mb-4 flex-col md:flex-row bg-white rounded-lg">
                <div className="md:w-3/5 md:order-last">
                    <Map mapStyle="h-[calc(100vh-12rem)]" />
                </div>
                <div className="md:w-2/5 md:order-first p-4">
                    <Detail />
                </div>
            </div>
        </div>
    );
};

export default Visual;
