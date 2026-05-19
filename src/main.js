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
canvas.panZoom({
    wheelZoom: false,   // custom logic instead
    panning: true
});

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

    let insertX = 0;    // find insertion index (where the drop zone should snap)
    let insertIndex = measure.items.length; // default to end
    for (let i = 0; i < measure.items.length; i++) {    // loops through measure to find the exact x-coord
        // ⭐⭐ you'll need y-values later
        
        const item = measure.items[i];

        // once we get to the bar (end) or if mouse is infront of/at the current element
        if (item.type === 'bar' || relativeX <= item.x) {
            // Snap the drop zone to the left of this item
            insertX = item.x - (item.width / 2) - (CONFIG.itemSpacing / 2);
            insertIndex = i;
            break; // Stop looking!
        }
    }

    // data for the measure, x pos relative to measure (center), index to insert in measure
    return { measure, insertX, insertIndex };   // this is an object!
}

canvas.on("mousemove", (e) => {   // show dropZone
    if (!State.selectedTool) {    // no selected tool
        dropZone.hide();
        return;
    }
    
    const data = getInsertionData(e);
    if (data) {
        const yOffset = data.measure.pageIndex * (CONFIG.pageHeight + CONFIG.pageSpace);    // y-value of the top of the page
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
    for (let i=0; i < 400; ++i) addMeasure();
    addMeasure();
});

// Zooming
function getZoom(zoom) {    // keep zoom within boundaries
    return Math.min(Math.max(zoom, CONFIG.zoomMin), CONFIG.zoomMax);
}
document.getElementById("zoom-in").addEventListener("click", () => canvas.zoom(getZoom(canvas.zoom() * (1+CONFIG.smallZoomFactor))));
document.getElementById("zoom-out").addEventListener("click", () => canvas.zoom(getZoom(canvas.zoom() / (1+CONFIG.smallZoomFactor))));
canvas.on("wheel", e => {
    e.preventDefault();

    if (e.ctrlKey) {    // zoom
        const zFactor = 1+CONFIG.zoomFactor;
        let currZoom = canvas.zoom();
        const newZoom = e.deltaY < 0? currZoom*zFactor : currZoom/zFactor;
        const point = canvas.point(e.clientX, e.clientY);   // centers zoom around mouse
        canvas.zoom(getZoom(newZoom), point);

        // check if we zoomed past any boundaries
        let vb = canvas.viewbox();
        currZoom = canvas.zoom();  // update variables
        let newY = vb.y;
        let newX = vb.x;

        const totalHeight = State.scoreData.layout.totalHeight;   // height of all pages
        const totalWidth = State.scoreData.layout.totalWidth;
        let margin = CONFIG.autoMargin/currZoom;
        
        const minY = -margin;   // highest possible height
        let maxY = Math.max(minY, totalHeight + margin - vb.h); // lowest possible height relative to the top of the viewbox
        if (vb.h >= totalHeight + (margin * 2) || newY < minY) {   // zoomed out too far
            newY = minY;
        } else if (newY > maxY) {
            newY = maxY;
        }

        margin = 0.3*CONFIG.width / currZoom;   // more margin for horizontal scrolling (for bigger screens)
        const minX = -margin;
        let maxX = Math.max(minX, totalWidth + margin - vb.w);
        if (vb.w >= totalWidth + (margin * 2) || newX < minX) {
            newX = minX;
        } else if (newX > maxX) {
            newX = maxX;
        }

        canvas.viewbox(newX, newY, vb.w, vb.h);
    } else if (e.shiftKey) { // manual horizontal scrolling
        const vb = canvas.viewbox();
        const zoom = canvas.zoom();     // use zoom so that you don't scroll by a ton when zoomed into a small area

        const scrollAmount = 0.25*e.deltaY / zoom;
        let newX = vb.x + scrollAmount;

        // limit how far they can scroll horizontally
        const totalWidth = State.scoreData.layout.totalWidth;   // width of pages
        const margin = 0.3*CONFIG.width / zoom;
        const minX = -margin;
        let maxX = Math.max(minX, totalWidth + margin - vb.w);
        
        if (newX < minX) {
            newX = minX;
        } else if (newX > maxX) {
            newX = maxX;
        }

        canvas.viewbox(newX, vb.y, vb.w, vb.h);
    } else {    // manual vertical scrolling
        const vb = canvas.viewbox();
        const zoom = canvas.zoom();     // use zoom so that you don't scroll by a ton when zoomed into a small area

        // deltaY pos=down, negative=up
        const scrollAmount = 0.25*e.deltaY / zoom;
        let newY = vb.y + scrollAmount;

        // limit how far they can scroll vertically
        const totalHeight = State.scoreData.layout.totalHeight;   // height of all pages
        const margin = CONFIG.autoMargin/zoom;
        const minY = -margin;   // highest possible height
        let maxY = Math.max(minY, totalHeight + margin - vb.h); // lowest possible height relative to the top of the viewbox
        
        if (newY < minY) {
            newY = minY;
        } else if (newY > maxY) {
            newY = maxY;
        }

        canvas.viewbox(vb.x, newY, vb.w, vb.h);     // min x coord, min y coord, width, height
    }
}, { passive: false });     // tells browser im preventing default behavior

// Panning
canvas.on("panning", function(e) {
    let vb = e.detail.box;  // contains info of what panZoom wants to change
    const zoom = canvas.zoom();
    let updated = false;    // checks if boundary has been broken (if we need to prevent the panning)

    let margin = CONFIG.autoMargin / zoom;
    const totalHeight = State.scoreData.layout.totalHeight; // total height of all pages
    const totalWidth = State.scoreData.layout.totalWidth;   // total width of your page setup

    const minY = -margin;
    let maxY = Math.max(minY, totalHeight + margin - vb.h);
    let newY = vb.y;
    if (vb.h >= totalHeight + (margin * 2) || newY < minY) {
        newY = minY;
        updated = true;
    } else if (newY > maxY) {
        newY = maxY;
        updated = true;
    }

    margin = 0.3*CONFIG.width / zoom;
    const minX = -margin;
    let maxX = Math.max(minX, totalWidth + margin - vb.w);
    let newX = vb.x;
    if (vb.w >= totalWidth + (margin * 2) || newX < minX) {
        newX = minX;
        updated = true;
    } else if (newX > maxX) {
        newX = maxX;
        updated = true;
    }

    if (updated) {
        e.preventDefault();
        canvas.viewbox(newX, newY, vb.w, vb.h);
    }
})

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

// var svgData = canvas.svg();   // XML
// console.log(svgData);
