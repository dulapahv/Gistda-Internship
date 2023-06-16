import { faker } from "@faker-js/faker";
import { BarElement, CategoryScale, Chart, LinearScale } from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";

Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(BarElement);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top",
        },
        title: {
            display: true,
            text: "Chart.js Bar Chart",
        },
    },
};

const labels = ["January", "February", "March", "April", "May", "June", "July"];

export const data = {
    labels,
    datasets: [
        {
            label: "Dataset 1",
            data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
            label: "Dataset 2",
            data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
    ],
};

function Barchart() {
    return <Bar options={options} data={data} />;
}

export default Barchart;
