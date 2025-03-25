import React from "react";
import WhiteBox from "./WhiteBox";

/**
 * Reusable component for displaying statistics.
 * @param {string} title - The title of the statistic.
 * @param {string|number} value - The value of the statistic.
 * @param {string} color - The color class for the value text.
 */
const StatBox = ({ title, value, color }) => (
  <WhiteBox className="text-center">
    <h2 className="text-sm font-semibold text-black">{title}</h2>
    <p className={`text-2xl font-bold mt-2 ${color} text-black`}>{value}</p>
  </WhiteBox>
);

export default StatBox;
