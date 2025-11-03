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
const spaceBetween = 0.01*width;       // space between notes
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
    bar: (x, measure) => {
        const bar = measure.line(x, 0, x, measureHeight).stroke({ width: barWidth, color: "black" });
        return bar;
    },
    note1: (x, parent) => {    // parent is usually (always i think) a measure
        const g = parent.group();   // create a group so you can add stuff to it later
        g.text("1").font({ size:noteSize, family: "Arial" }).x(x);
        return g;
    },
    note2: (x, parent) => {
        const g = parent.group();
        g.text("2").font({ size:noteSize, family: "Arial" }).x(x);
        return g;
    },
    note3: (x, parent) => {
        const g = parent.group();
        g.text("3").font({ size:noteSize, family: "Arial" }).x(x);
        return g;
    },
    note4: (x, parent) => {
        const g = parent.group();
        g.text("4").font({ size:noteSize, family: "Arial" }).x(x);
        return g;
    },
    note5: (x, parent) => {
        const g = parent.group();
        g.text("5").font({ size:noteSize, family: "Arial" }).x(x);
        return g;
    },
    note6: (x, parent) => {
        const g = parent.group();
        g.text("6").font({ size:noteSize, family: "Arial" }).x(x);
        return g;
    },
    note7: (x, parent) => {
        const g = parent.group();
        g.text("7").font({ size:noteSize, family: "Arial" }).x(x);
        return g;
    },
};

const itemData = {  // kinda useless rn idk if ill keep this
    "note1": {width: 0.015*width, icon: "1"},
    "note2": {width: 0.015*width, icon: "2"},
    "note3": {width: 0.015*width, icon: "3"},
    "note4": {width: 0.015*width, icon: "4"},
    "note5": {width: 0.015*width, icon: "5"},
    "note6": {width: 0.015*width, icon: "6"},
    "note7": {width: 0.015*width, icon: "7"},
    "rest": {width: 0.015*width, icon: "-"},
}

// FUNCTIONS --------------------------------------------------------------------
function layoutRerender(start) {
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

function addItem(id, measureGroup, measure) {
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

function createDropZone(measureGroup, measure, x, index) {
    let id = "d" + crypto.randomUUID().slice(0,6);

    const dropZone = measureGroup.rect(dropZoneWidth, measureHeight)
        .fill("transparent")
        .x(x);
    dropZone.mouseover(() => {
        if (selectedTool) dropZone.fill("#cceeff");
    });
    dropZone.mouseout(() => dropZone.fill("transparent"));
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

function getStartY() {
    let startY = 0.125;
    if (isSubtitle) startY += 0.04;
    if (isComposer) startY += 0.06;
    if (isArranger) startY += 0.05;

    return startY*width;
}

function addMeasure() { // drop zone and bar
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
    measure.items.push({type: "bar", x: measureWidth, width: barWidth, svg: barSvg});

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
document.getElementById("subtitle-input").addEventListener("input", e => {
    subtitleText.text(e.target.value);
    scoreData.meta.subtitle = e.target.value;
});

const compText = page.text("None")
    .font({ size: 0.03*width, family: "Arial" })
    .attr({x: 0.9*width, y: yComp, "text-anchor": "end", "visibility": "hidden"});
document.getElementById("composer-input").addEventListener("input", e => {
    compText.text(e.target.value);
    scoreData.meta.composer = e.target.value;
});

const arrText = page.text("None")
    .font({ size: 0.03*width, family: "Arial" })
    .attr({x: 0.9*width, y: yArr, "text-anchor": "end", "visibility": "hidden"});
document.getElementById("arranger-input").addEventListener("input", e => {
    arrText.text(e.target.value);
    scoreData.meta.arranger = e.target.value;
});

const subtitleCheck = document.getElementById("subtitle-checkbox");
subtitleCheck.addEventListener("change", () => {
    if (subtitleCheck.checked) {
        isSubtitle = true;
        subtitleText.attr("visibility", "visible");
        yComp += 0.02*height;
        compText.y(yComp);
        yArr += 0.02*height;
        arrText.y(yArr);
        layoutRerender(0);
    } else {
        isSubtitle = false;
        subtitleText.attr("visibility", "hidden");
        yComp -= 0.02*height;
        compText.y(yComp);
        yArr -= 0.02*height;
        arrText.y(yArr);
        layoutRerender(0);
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
        layoutRerender(0);
    } else {
        isComposer = false;
        compText.attr("visibility", "hidden");
        yArr -= 0.025*height;
        arrText.y(yArr);
        layoutRerender(0);
    }
});

const arrCheck = document.getElementById("arranger-checkbox");
arrCheck.addEventListener("change", () => {
    if (arrCheck.checked) {
        isArranger = true;
        arrText.y(yArr);
        arrText.attr("visibility", "visible");
        layoutRerender(0);
    } else {
        isArranger = false;
        arrText.attr("visibility", "hidden");
        layoutRerender(0);
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
