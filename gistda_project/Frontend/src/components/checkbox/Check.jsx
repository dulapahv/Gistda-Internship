import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import React from "react";
import { useTranslation } from "react-i18next";

function Check({ label }) {
    const { t } = useTranslation();

    return (
        <div>
            <FormControlLabel
                control={<Checkbox defaultChecked />}
                label={t(label)}
            />
        </div>
    );
}

export default Check;
