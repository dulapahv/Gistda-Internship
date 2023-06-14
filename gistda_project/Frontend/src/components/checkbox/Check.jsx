import React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const Check = ({ label }) => {
    return (
        <div>
            <FormControlLabel
                control={<Checkbox defaultChecked />}
                label={label}
            />
        </div>
    );
};

export default Check;
