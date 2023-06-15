import React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useTranslation } from "react-i18next";

const Check = ({ label }) => {
    const { t } = useTranslation();

    return (
        <div>
            <FormControlLabel
                control={<Checkbox defaultChecked />}
                label={t(label)}
            />
        </div>
    );
};

export default Check;
