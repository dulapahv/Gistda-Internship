import React from "react";
import { Chart, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Bar } from "react-chartjs-2";
import { faker } from "@faker-js/faker";

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

const Barchart = () => {
    return (
        <div>
            <Bar options={options} data={data} />
        </div>
    );
};

export default Barchart;
