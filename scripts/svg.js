// VARIABLES --------------------------------------------------------------------
const container = document.getElementById("sheet-container");
const width = container.clientWidth - 50;
const height = 11*width/8.5;    // based on average paper sizes
const bottomMargin = 0.075*height;
let noteSize = 0.03*width;
// Measures Variables
const measureHeight = 0.05*width;   // permanent
const measureWidth = 0.05*width;    // default before anything is added
const defaultMeasureX = 0.1*width;  // x position
const rowLength = 0.8*width;        // length of each row
const noteSpace = 0.01*width;       // space between notes
let barWidth = 0.001*width;
let rowSpace = 0.1*width;        // space inbetween rows (let users edit later)
let dropZoneWidth = 0.03*width;
// Layout Variables
let isSubtitle = false;
let isComposer = false;
let isArranger = false;

let scoreData = {
    meta: {
        title: "Untitled",
        subtitle: null,
        composer: null,
        arranger: null,
        key: null,
        tempo: null
    },
    measures: []    // will contain objects which represent each measure and will contain another array for notes
};
let selectedTool = null;

// Create the editor page (will expand infinitely)
const page = SVG().addTo(container).size(width, height);
const pageBg = page.rect(width, height).fill("white");
let currHeight = height;

const iconMap = {   // object matching icon types to creating an SVG on the page
    bar: (measure) => {
        measure.line(measureWidth, 0, measureWidth, measureHeight)
        .stroke({ width: barWidth, color: "black" });
    },
    note1: (x, y, page) => {    // page just refers to its "parent" usually a measure
        const g = page.group(); // create a group so you can add stuff to it later
        g.add(page.text("1")).font({ size:noteSize, family: "Arial" }).move(x, y);
    },
    note2: (x, y, page) => {
        const g = page.group();
        g.add(page.text("2")).font({ size:noteSize, family: "Arial" }).move(x, y);
    },
    note3: (x, y, page) => {
        const g = page.group();
        g.add(page.text("3")).font({ size:noteSize, family: "Arial" }).move(x, y);
    },
    note4: (x, y, page) => {
        const g = page.group();
        g.add(page.text("4")).font({ size:noteSize, family: "Arial" }).move(x, y);
    },
    note5: (x, y, page) => {
        const g = page.group();
        g.add(page.text("5")).font({ size:noteSize, family: "Arial" }).move(x, y);
    },
    note6: (x, y, page) => {
        const g = page.group();
        g.add(page.text("6")).font({ size:noteSize, family: "Arial" }).move(x, y);
    },
    note7: (x, y, page) => {
        const g = page.group();
        g.add(page.text("7")).font({ size:noteSize, family: "Arial" }).move(x, y);
    },
};

// FUNCTIONS --------------------------------------------------------------------
function addNote(measure) {
    // replace dropzone and create 2 drop zones to the left and right
    // redraw the items in the measure & shift all measures afterwards
}

function getStartY() {
    let startY = 0.125;
    if (isSubtitle) startY += 0.04;
    if (isComposer) startY += 0.06;
    if (isArranger) startY += 0.05;

    return startY*width;
}

function layoutRerender() {
    // loop from changed note thru all measures until a line isn't pushed down
    scoreData.measures.forEach(measure => {
        const x = measure.x;
        const y = getStartY() + measure.row*rowSpace;
        measure.svg.move(x, y);
    });
}

function addMeasure() { // drop zone and bar
    const index = scoreData.measures.length;
    let row = 1;
    let x = defaultMeasureX;
    let newRow = false;
    if (index > 0) {    // evaluate measures before this new measure
        row = scoreData.measures[index-1].row;
        x = scoreData.measures[index-1].x + scoreData.measures[index-1].width;
        if (x-defaultMeasureX > rowLength) {
            newRow = true;
            row++;
            x = defaultMeasureX;
        }
    } 

    let measure = {
        order: index+1,
        row: row,
        x: x,        // based on the row it's on
        width: measureWidth,    // before anything has been added
        items: [{type: "bar"}]  // each note will be its own object {} with metadata
    };

    // Check if we need to extend the page
    const y = getStartY() + row*rowSpace;
    if (newRow && y+measureHeight > currHeight-bottomMargin) {
        currHeight += rowSpace;
        page.height(currHeight);
        pageBg.height(currHeight);
    }

    // Visually display the new measure using x & y values
    const measureGroup = page.group();
    const dropZone = measureGroup.rect(dropZoneWidth, measureHeight)
        .fill("transparent")
        .x(noteSpace);
    iconMap["bar"](measureGroup);
    measureGroup.move(x, y);

    dropZone.mouseover(() => {
        if (selectedTool) dropZone.fill("#cceeff")
    });
    dropZone.mouseout(() => dropZone.fill("transparent"));
    dropZone.click(() => {
        if (selectedTool && iconMap[selectedTool]) {
            // WIP: calculate x & y values (placeholders for now)
            // break into new function pls to readjust everything after the note has been added
            const xItem = 100;
            iconMap[selectedTool](xItem, y, measureGroup);
            measure.items.push({
                type: selectedTool,
                x: xItem,
                width: 5
            });

            console.log(measures);
        }
    });

    measure.svg = measureGroup;
    scoreData.measures.push(measure);
}

function showPreview() {
    alert("Preview functionality in progress.\nWhen complete, it will be a popup showing all individual pages of sheet music without drop zones occupying any space. The preview will ideally have proper spacing for different note durations and different spacing for each horizontal line of music so that all lines start and end at the same x values (properly lined up)");
}

// EVENT LISTENERS --------------------------------------------------------------
let prevSelected = null;
document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", () => {
        if (prevSelected && prevSelected !== icon) prevSelected.classList.remove("selected");
        icon.classList.toggle("selected");
        if (selectedTool === icon.dataset.type) {
            selectedTool = null;
            document.body.style.cursor = "auto";
        } else {
            selectedTool = icon.dataset.type
            document.body.style.cursor = "pointer";
        } prevSelected = icon;
    });
});

// Adding Measures
document.getElementById("add-measure-btn").addEventListener("click", () => {
    // for (let i=0; i < 5; ++i) addMeasure();
    addMeasure();
});

// Adding Layout Details (title, composer, etc.)
const titleText = page.text("Untitled")
    .font({ size: 0.05*width, family: "Arial" })
    .center(width/2, 0.1*height);
document.getElementById("title-input").addEventListener("input", e => {
    titleText.text(e.target.value).center(width/2, 0.1*height);
});

let yComp = 0.15*height;
let yArr = 0.15*height;
const subtitleText = page.text("None")
    .font({ size: 0.03*width, family: "Arial" })
    .center(width/2, 0.14*height)
    .attr("visibility", "hidden");
document.getElementById("subtitle-input").addEventListener("input", function(e) { subtitleText.text(e.target.value); });

const compText = page.text("None")
    .font({ size: 0.03*width, family: "Arial" })
    .attr({x: 0.9*width, y: yComp, "text-anchor": "end", "visibility": "hidden"});
document.getElementById("composer-input").addEventListener("input", function(e) { compText.text(e.target.value); });

const arrText = page.text("None")
    .font({ size: 0.03*width, family: "Arial" })
    .attr({x: 0.9*width, y: yArr, "text-anchor": "end", "visibility": "hidden"});
document.getElementById("arranger-input").addEventListener("input", function(e) { arrText.text(e.target.value); });

const subtitleCheck = document.getElementById("subtitle-checkbox");
subtitleCheck.addEventListener("change", () => {
    if (subtitleCheck.checked) {
        isSubtitle = true;
        subtitleText.attr("visibility", "visible");
        yComp += 0.02*height;
        compText.y(yComp);
        yArr += 0.02*height;
        arrText.y(yArr);
        layoutRerender();
    } else {
        isSubtitle = false;
        subtitleText.attr("visibility", "hidden");
        yComp -= 0.02*height;
        compText.y(yComp);
        yArr -= 0.02*height;
        arrText.y(yArr);
        layoutRerender();
    }
});

const compCheck = document.getElementById("composer-checkbox");
compCheck.addEventListener("change", () => {
    if (compCheck.checked) {
        isComposer = true;
        compText.y(yComp);
        compText.attr("visibility", "visible");
        yArr += 0.025*height;
        arrText.y(yArr);
        layoutRerender();
    } else {
        isComposer = false;
        compText.attr("visibility", "hidden");
        yArr -= 0.025*height;
        arrText.y(yArr);
        layoutRerender();
    }
});

const arrCheck = document.getElementById("arranger-checkbox");
arrCheck.addEventListener("change", () => {
    if (arrCheck.checked) {
        isArranger = true;
        arrText.y(yArr);
        arrText.attr("visibility", "visible");
        layoutRerender();
    } else {
        isArranger = false;
        arrText.attr("visibility", "hidden");
        layoutRerender();
    }
});

// Preview
document.getElementById("preview-btn").addEventListener("click", showPreview);

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

var svgData = page.svg();   // XML
console.log(svgData);
