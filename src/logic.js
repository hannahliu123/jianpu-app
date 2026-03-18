// manipulates data/updates it based on user actions

import * as CONFIG from './constants.js';
import { createItem, renderMeasure } from './renderer.js';
import { getStartY } from './state.js';

// Add selectedTool to targetIndex of measure
export function addItem(targetIndex, measure, selectedTool, scoreData) {
    let prefix = "n-";
    if (selectedTool === "bar") prefix = "b-";

    // create new data for the new item being inserted
    let newItem = ({
        id: prefix + crypto.randomUUID().slice(0, 8),
        type: selectedTool,
        width: CONFIG.itemData[selectedTool].width,
        x: 0    // placeholder, updated in updateInternalMeasureWidth()
    });

    newItem.svg = createItem(newItem, measure.svgGroup);    // create the svg
    measure.items.splice(targetIndex, 0, newItem);  // add into measure
    updateInternalMeasureWidth(measure);
    layoutRerender(scoreData, scoreData.measures.indexOf(measure));
}

export function addMeasureData(scoreData) {
    const newMeasure = {
        id: `m-${crypto.randomUUID().slice(0, 8)}`,
        items: [],
        x: 0,
        y: 0,
        row: 1,
        width: 0,   // for now (until a bar is added)
        pageIndex: 0,
        svgGroup: null
    };
    scoreData.measures.push(newMeasure);
    return newMeasure;
}

// Loop from changed note thru all measures until a line isn't pushed down (only moves MEASURES as groups, not the internal notes within them)
export function layoutRerender(scoreData, start) {
    console.log(scoreData, start);   // debugging

    let currX = CONFIG.defaultMeasureX;
    let currRow = 1;
    let currPage = 0;

    if (start > 0) {    // update variables to one before start
        const prevMeasure = scoreData.measures[start - 1];
        currX = prevMeasure.x + prevMeasure.width + CONFIG.measureSpacing;
        currRow = prevMeasure.row;
        currPage = prevMeasure.pageIndex;
    }

    for (let i = start; i < scoreData.measures.length; i++) {
        const measure = scoreData.measures[i];

        if (currX + measure.width > CONFIG.rowLength) {
            console.log("wrap to next ROW at measure index " + i);  // debugging

            // wrap to next row
            currRow++;
            currX = CONFIG.defaultMeasureX;
        }

        let currY = getStartY(currPage) + (currRow * CONFIG.rowSpace);
        if (currY + CONFIG.measureHeight > CONFIG.pageHeight - CONFIG.bottomMargin) {
            console.log("wrap to next PAGE at measure index " + i);  // debugging

            // wrap to next page
            currPage++;
            currRow = 1;
            currY = getStartY(currPage) + CONFIG.rowSpace;
        }

        measure.x = currX;
        measure.y = currY;
        measure.row = currRow;
        measure.pageIndex = currPage;
        
        renderMeasure(measure);
        currX += measure.width + CONFIG.measureSpacing;

        // ⭐⭐ check if oldpos === newpos, if so break
    }
}

function updateInternalMeasureWidth(measure) {
    let measureX = 0;   // x value relative to current measure
    measure.items.forEach(item => {
        item.x = measureX + item.width/2;  // update data
        if (item.svg) {
            item.svg.cx(item.x);   // update svg (shhh we don't talk about why this isn't in renderer.js im too lazy)
            item.svg.y(0);  // make sure y pos relative to measure doesn't change
        } measureX += item.width + CONFIG.itemSpacing;
    });
    measure.width = measureX;
}
