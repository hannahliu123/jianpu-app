import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import './style.css';      // replaces the <link> tag in HTML
import * as State from './state.js';
import * as CONFIG from './constants.js';
import { setupEditorUI, setupHeader } from './setup.js';
import { addItem, addMeasureData } from './logic.js';
import { createMeasure, createPageGroup } from './renderer.js';

// Create the editor canvas (will expand infinitely)
const canvas = SVG().addTo(CONFIG.container)
    .size(CONFIG.screenWidth, CONFIG.screenHeight)
    .viewbox(-CONFIG.autoMargin, -CONFIG.autoMargin, CONFIG.screenWidth, CONFIG.screenHeight);
canvas.panZoom({ zoomMin: 0.25, zoomMax: 5, zoomFactor: 0.1 });

setupEditorUI();    // Initialize UI
const musicLayer = canvas.group().id("music-layer");
const uiLayer = canvas.group().id("ui-layer");  // Always in front :)
const firstPage = createPageGroup(0, musicLayer);   // use this as a placeholder/default page
setupHeader(firstPage);    // set up header on first page

const dropZone = uiLayer.rect(2, CONFIG.measureHeight)
    .fill("#37d4ffff")
    .hide();

function getInsertionData(e) {
    // e.target is the item your mouse is hovering over
    const measureElement = e.target.closest('.measure-group');
    if (!measureElement) return null;

    // convert screen mouse position to SVG coordinates
    const svgPt = canvas.point(e.clientX, e.clientY);

    // find measure data (⭐⭐ you'll need y-values later)
    const measureId = measureElement.id;
    const measure = State.scoreData.measures.find(m => m.id === measureId);
    const relativeX = svgPt.x - measure.x;  // relative x inside the measure

    // find insertion index (where the drop zone should snap)
    let insertX = 0;
    let accumulatedX = 0;
    let insertIndex = 0;
    for (let i = 0; i < measure.items.length; i++) {    // ⭐⭐ CHANGE HOVER DETECTION LATER 
        const item = measure.items[i];
        const itemWidth = item.width;
        // if mouse is past the halfway point of this note, move the line to the right of it
        if (relativeX > accumulatedX + (itemWidth / 2)) {
            insertX = accumulatedX + itemWidth + (CONFIG.itemSpacing / 2);
            insertIndex = i+1;  // after current item
        } accumulatedX += itemWidth + CONFIG.itemSpacing;
    }

    // data for the measure, x pos relative to measure, index to insert in measure
    return { measure, insertX, insertIndex };   // this is an object!
}

canvas.on("mousemove", (e) => {   // show dropZone
    if (!State.selectedTool) {    // no selected tool
    dropZone.hide();
        return;
    }
    
    const data = getInsertionData(e);
    if (data) {
        const yOffset = data.measure.pageIndex * (CONFIG.pageHeight + CONFIG.pageSpace);
        dropZone.move(data.measure.x + data.insertX, data.measure.y + yOffset).show();
    } else dropZone.hide();
});

canvas.on('click', (e) => {   // add item
    if (!State.selectedTool) return;

    const data = getInsertionData(e);
    if (data) {
        addItem(data.insertIndex, data.measure, State.selectedTool, State.scoreData);
    }
});

function addMeasure() { // add to end of music
    const newMeasure = addMeasureData(State.scoreData);
    // put it on the firstPage (default) for now but its page & position will be updated later
    newMeasure.svgGroup = createMeasure(newMeasure, firstPage)
    // add the bar, which also later calls layoutRerender()
    addItem(0, newMeasure, "bar", State.scoreData);
}

// Selecting a tool (note)
let prevSelected = null;
document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", () => {
        if (prevSelected && prevSelected !== icon) {
            prevSelected.classList.remove("selected");
        } icon.classList.toggle("selected");

        const clickedTool = icon.dataset.type;
        if (State.selectedTool === clickedTool) {
            State.setTool(null);
            document.body.style.cursor = "auto";
        } else {
            State.setTool(clickedTool);
            document.body.style.cursor = "pointer";
        } prevSelected = icon;
    });
});

// Adding Measures
document.getElementById("add-measure-btn").addEventListener("click", () => {
    // for (let i=0; i < 5; ++i) addMeasure();
    addMeasure();
});

// Zooming
document.getElementById("zoom-in").addEventListener("click", () => canvas.zoom(canvas.zoom() * 1.2));
document.getElementById("zoom-out").addEventListener("click", () => canvas.zoom(canvas.zoom() / 1.2));

// Preview
document.getElementById("preview-btn").addEventListener("click", () => {
    alert("Preview functionality in progress.\nWhen complete, it will be a popup showing all individual pages of sheet music without drop zones occupying any space. The preview will ideally have proper spacing for different note durations and different spacing for each horizontal line of music so that all lines start and end at the same x values (properly lined up)");
});

// Saving
document.getElementById("save-btn").addEventListener("click", () => {
    alert("Saving functionality currently in progress")
});

// Sharing
document.getElementById("share-btn").addEventListener("click", () => {
    document.getElementById("share-popup").classList.add("active");
});

document.getElementById("exit-share").addEventListener("click", () => {
    document.getElementById("share-popup").classList.remove("active");
});

document.getElementById("download-btn").addEventListener("click", () => {
    alert("Download functionality currently in progress")
});

document.getElementById("print-btn").addEventListener("click", () => {
    alert("Printing functionality currently in progress")
});

var svgData = canvas.svg();   // XML
console.log(svgData);
