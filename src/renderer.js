import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import { container, screenWidth, screenHeight, autoMargin, width, height, bottomMargin, noteSize, textWidth, measureHeight, measureWidth, defaultMeasureX, rowLength, spaceBetween, barWidth, barSpace, rowSpace, dropZoneWidth, dropLineWidth } from './constants.js';

// NONE OF THIS WORKS!!!! ISN'T THIS GREAT?!?!

export function createEditorPage() {
    const page = SVG().addTo(container).size(screenWidth, screenHeight).viewbox(-autoMargin, -autoMargin, screenWidth, screenHeight);
    page.panZoom({ zoomMin: 0.25, zoomMax: 5, zoomFactor: 0.1 });
    const pageBg = page.rect(width, height).fill("white").stroke({ color: "gray", width: 0.25 });
    let currHeight = height;
}

export function layoutRerender(start) {
    // Loop from changed note thru all measures until a line isn't pushed down
    let newX = -1;
    let currRow = 1;
    scoreData.measures.forEach(measure => {
        if (measure.order < start) return;
        if (newX !== -1) measure.x = newX;
        if (measure.row < currRow) measure.row = currRow;
        if (measure.x+measure.width-defaultMeasureX > rowLength) {
            currRow++;
            measure.row = currRow;
            measure.x = defaultMeasureX;
        }
        const y = getStartY() + measure.row*rowSpace;
        measure.svg.move(measure.x, y);

        newX = measure.x + measure.width;

        // need to stop if there is no overflow for the last measure)
        // UNFINISHED
    });
}

export function addItem(id, measureGroup, measure) {
    const index = measure.items.findIndex(item => item.id === id);  // index of drop zone in measure.items
    const xItem = measure.items[index].x + dropZoneWidth + spaceBetween;
    const itemSvg = iconMap[selectedTool](xItem, measureGroup);

    let item = ({
        type: selectedTool,
        x: xItem,
        width: itemData[selectedTool].width,   // might be wrong idk (maybe change values later)
        svg: itemSvg
    });

    measure.items.splice(index+1, 0, item); // insert after old drop zone
    createDropZone(measureGroup, measure, xItem+item.width+spaceBetween, index+2);

    // adjust x values of all items after
    let prevX = xItem + item.width + dropZoneWidth + 2*spaceBetween;
    measure.items.forEach(item => {
        if (measure.items.indexOf(item) <= index+2) return;
        item.x = prevX;
        item.svg.x(item.x);
        prevX += item.width + spaceBetween;
    });
    
    measure.width = prevX - spaceBetween;
    layoutRerender(measure.order);
}

export function createDropZone(measureGroup, measure, x, index) {
    let id = "d" + crypto.randomUUID().slice(0,6);

    const dropZone = measureGroup.group();
    const dropLine = dropZone.line(x+dropZoneWidth/2, 0, x+dropZoneWidth/2, measureHeight).stroke({ width: dropLineWidth, color: "transparent" });
    dropZone.rect(dropZoneWidth, measureHeight)
        .fill("transparent")
        .x(x);
    dropZone.mouseover(() => {
        if (selectedTool) dropLine.stroke("#37d4ffff");
    });
    dropZone.mouseout(() => dropLine.stroke("transparent"));
    dropZone.click(() => {
        if (selectedTool && iconMap[selectedTool]) {
            addItem(id, measureGroup, measure);
        }
    });

    let dropZoneObject = {
        type: "drop",
        x: x,
        width: dropZoneWidth,
        id: id,
        svg: dropZone
    };
    measure.items.splice(index, 0, dropZoneObject);
}

export function getStartY() {
    let startY = 0.125;
    if (isSubtitle) startY += 0.04;
    if (isComposer) startY += 0.06;
    if (isArranger) startY += 0.05;

    return startY*width;
}

export function addMeasure() { // drop zone and bar
    const index = scoreData.measures.length;
    let row = 1;
    let x = defaultMeasureX;
    let newRow = false;
    if (index > 0) {    // evaluate measures before this new measure
        row = scoreData.measures[index-1].row;
        x = scoreData.measures[index-1].x + scoreData.measures[index-1].width;
        if (x+measureWidth-defaultMeasureX > rowLength) {
            newRow = true;
            row++;
            x = defaultMeasureX;
        }
    } 

    let measure = {
        order: index,
        row: row,
        x: x,        // based on the row it's on
        width: measureWidth,    // before anything has been added
        items: [], // each note will be its own object {} with metadata (these include drop zones)
    };

    // Check if we need to extend the page
    const y = getStartY() + row*rowSpace;
    if (newRow && y+measureHeight > currHeight-bottomMargin) {
        currHeight += rowSpace;
        page.height(currHeight);
        pageBg.height(currHeight);
    }

    // Visually display the new measure using x & y values
    const measureGroup = page.nested().move(x, y);
    createDropZone(measureGroup, measure, spaceBetween, 0);

    const barSvg = iconMap["bar"](measureWidth, measureGroup);
    measure.items.push({type: "bar", x: measureWidth, width: barSpace, svg: barSvg});

    measure.svg = measureGroup;
    scoreData.measures.push(measure);
}

export function showPreview() {
    alert("Preview functionality in progress.\nWhen complete, it will be a popup showing all individual pages of sheet music without drop zones occupying any space. The preview will ideally have proper spacing for different note durations and different spacing for each horizontal line of music so that all lines start and end at the same x values (properly lined up)");
}

export function somethingidkyet() {
    var svgData = page.svg();   // XML
    console.log(svgData);
}
