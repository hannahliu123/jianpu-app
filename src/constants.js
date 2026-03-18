// MAYBE LATER: capitalize variables that won't change

export const container = document.getElementById("sheet-container");
export const autoMargin = 25;   // initial (automatic) margin above and to the right of the starting page when you load up the app
export const screenWidth = container.clientWidth;
export const screenHeight = container.clientHeight;
export const width = screenWidth - 2*autoMargin;    // width of paper
export const pageHeight = 11*width/8.5;         // based on average paper sizes (for now)
export const bottomMargin = 0.075*pageHeight;   // margin at bottom of page
export const pageSpace = 0.02*pageHeight;       // space between pages
export let noteSize = 0.03*width;

// Setup
export let titleSize = 0.05*width;
export let titleY = 0.1*pageHeight;
export let subtitleSize = 0.03*width;
export let subtitleY = 0.14*pageHeight;
export let rightAlignX = 0.9*width;

// Measures Variables
export const measureHeight = 0.05*width;   // permanent
export const measureWidth = 0.02*width;    // default before anything is added
export const measureSpacing = 0.0*width;   // space between measures (0 for now)
export const defaultMeasureX = 0.1*width;  // x position
export const defaultMeasureY = 0.0*width;  // y position for pages after the first (CHANGE IT)
export const rowLength = 0.9*width;        // length of each row
export const itemSpacing = 0.0*width;      // space between notes
export let barWidth = 0.001*width;
export let barSpace = 0.01*width;      // total space a bar occupies (plus padding)
export let rowSpace = 0.1*width;       // space inbetween rows (let users edit later)
export let dropZoneWidth = 0.01*width;
export let dropLineWidth = 0.0025*width;

export const itemData = {   // not currently using the width for anything
    "bar": { width: barSpace }, // lowkey uselessssssss
    "note1": {width: noteSize, icon: "1"},
    "note2": {width: noteSize, icon: "2"},
    "note3": {width: noteSize, icon: "3"},
    "note4": {width: noteSize, icon: "4"},
    "note5": {width: noteSize, icon: "5"},
    "note6": {width: noteSize, icon: "6"},
    "note7": {width: noteSize, icon: "7"},
    "rest": {width: noteSize, icon: "-"},
}
