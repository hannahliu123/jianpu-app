// VARIABLES --------------------------------------------------------------------
const container = document.getElementById("sheet-container");
const width = container.clientWidth - 50;
const height = 11*width/8.5;    // based on average paper sizes
var noteSize = 0.03*width;
var allPages = [];
// Measures Variables
var allMeasures = [];
const measureHeight = 0.05*width;   // permanent
const measureWidth = 0.05*width;    // default before anything is added
var barWidth = 0.02*measureHeight;
const defaultMeasureX = 0.1*width;  // x position
const defaultMeasureY = 0.1*height; // y position
let pageOneOffset = 0.075*height;   // offset due to title & other text on the first page
let rowSpace = 0.025*height;        // space in between rows

let selectedTool = null;

// FUNCTIONS --------------------------------------------------------------------
const iconMap = {   // object matching icon types to creating an SVG on the page
    note1: (x, y, page) => {
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

function updatePageNumbers() {
    allPages.forEach((p, i) => {    // p is the page itself (SVG), i is index
        // Update the value (text) for each page's page number
        p.pageNumber.text((i+1).toString());    // bc i is 0-indexed
    });
}

function addPage() {
    const page = SVG().addTo(container).size(width, height);
    page.rect(width, height).fill("white");

    // Add page number (placeholder element)
    const pageNum = page.text("").font({ size:noteSize, family: "Arial" })
        .move(0.5*width, 0.92*height);
    page.pageNumber = pageNum;  // assign it to a variable so it can be edited easily

    allPages.push(page);
    updatePageNumbers();
    return page;
}

function removePage() { // only able to remove the last page (for now)
    if (allPages.length > 1) {
        // Confirm page delete
        if (!confirm("Are you sure you want to delete page " + allPages.length + "?")) return;

        const p = allPages.pop();   // returns the popped page too
        p.remove();
        updatePageNumbers();    // technically don't need this rn but imma keep it for later
    } else alert("You cannot delete the last page.")
}

// Track where to add the next measure
let currPageIndex = 0;
let currMeasureX = defaultMeasureX;
let currMeasureY = defaultMeasureY;
function addMeasure() {
    var page = allPages[currPageIndex];
    if (allMeasures.length === 0) currMeasureY += pageOneOffset;

    // If the measure needs to go onto the next row
    if (currMeasureX + measureWidth > 0.9*width) {
        currMeasureX = defaultMeasureX;
        currMeasureY += measureHeight + rowSpace;

        // If the measure needs to go onto the next page
        if (currMeasureY + measureHeight > 0.9*height) {
            currPageIndex++;

            // Check if we need a new page added or not
            if (allPages.length < currPageIndex+1) addPage();

            page = allPages[currPageIndex];
            currMeasureY = defaultMeasureY;
        }
    }

    const measureGroup = page.group();
    const dropZone = measureGroup.rect(0.6*measureWidth, measureHeight)
        .fill("transparent")
        .move(currMeasureX+0.2*measureWidth, currMeasureY);
    measureGroup.line(currMeasureX+measureWidth, currMeasureY, currMeasureX+measureWidth, currMeasureY+measureHeight)
        .stroke({ width: barWidth, color: "black" });
    
    dropZone.mouseover(() => {
        if (selectedTool) dropZone.fill("#cceeff")
    });
    dropZone.mouseout(() => dropZone.fill("transparent"));
    dropZone.click(() => {
        if (selectedTool && iconMap[selectedTool]) {
            // WIP: calculate x & y values (placeholders for now)
            const x = 100;
            const y = 100;
            iconMap[selectedTool](x, y, measureGroup);
        }
    });
}

addPage();

// EVENT LISTENERS --------------------------------------------------------------
let prevSelected = null;
document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", () => {
        if (prevSelected) prevSelected.classList.remove("selected");
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

// Adding/Removing Pages
document.getElementById("add-page-btn").addEventListener("click", addPage);
document.getElementById("remove-page-btn").addEventListener("click", removePage);

// Adding Measures
document.getElementById("add-measure-btn").addEventListener("click", () => {
    addMeasure();
});

// Adding Layout Details (title, composer, etc.)
const titleText = allPages[0].text("Untitled")
    .font({ size: 0.05*width, family: "Arial" })
    .center(width/2, 0.1*height);

document.getElementById("title-input").addEventListener("input", e => {
    titleText.text(e.target.value).center(width/2, 0.1*height);
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

var svgData = allPages[0].svg();   // XML
console.log(svgData);
