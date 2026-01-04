// MAYBE LATER: capitalize variables that won't change

export const container = document.getElementById("sheet-container");
export const screenWidth = container.clientWidth;
export const screenHeight = container.clientHeight;
export const autoMargin = 25;
export const width = screenWidth - 2*autoMargin;
export const height = 11*width/8.5;    // based on average paper sizes
export const bottomMargin = 0.075*height;
export let noteSize = 0.03*width;
export let textWidth = 3*width;

// Measures Variables
export const measureHeight = 0.05*width;   // permanent
export const measureWidth = 0.02*width;    // default before anything is added
export const defaultMeasureX = 0.1*width;  // x position
export const rowLength = 0.8*width;        // length of each row
export const spaceBetween = 0.0*width;       // space between notes
export let barWidth = 0.001*width;
export let barSpace = 0.01*width;      // total space a bar occupies (plus padding)
export let rowSpace = 0.1*width;        // space inbetween rows (let users edit later)
export let dropZoneWidth = 0.01*width;
export let dropLineWidth = 0.0025*width;

