const container = document.getElementById("sheet-container");
const icons = document.querySelectorAll(".icon");
const width = container.clientWidth - 100;
const height = 11*width/8.5;    // based on average paper sizes
var noteSize = 0.03*width;
var barSize = 0.05*width;
const allPages = [];

const iconMap = {   // object matching icon types to creating an SVG on the page
    bar: (x, y, page) => {
        const l = page.line(x, y, x, y+barSize).stroke({ width: 1, color: "black" });
        l.draggable();
    },
    note1: (x, y, page) => {
        const g = page.group(); // create a group so you can add stuff to it later
        g.add(page.text("1")).font({ size:noteSize, family: "Arial" }).move(x, y);
        g.draggable();
    },
    note2: (x, y, page) => {
        const g = page.group();
        g.add(page.text("2")).font({ size:noteSize, family: "Arial" }).move(x, y);
        g.draggable();
    },
    note3: (x, y, page) => {
        const g = page.group();
        g.add(page.text("3")).font({ size:noteSize, family: "Arial" }).move(x, y);
        g.draggable();
    },
    note4: (x, y, page) => {
        const g = page.group();
        g.add(page.text("4")).font({ size:noteSize, family: "Arial" }).move(x, y);
        g.draggable();
    },
    note5: (x, y, page) => {
        const g = page.group();
        g.add(page.text("5")).font({ size:noteSize, family: "Arial" }).move(x, y);
        g.draggable();
    },
    note6: (x, y, page) => {
        const g = page.group();
        g.add(page.text("6")).font({ size:noteSize, family: "Arial" }).move(x, y);
        g.draggable();
    },
    note7: (x, y, page) => {
        const g = page.group();
        g.add(page.text("7")).font({ size:noteSize, family: "Arial" }).move(x, y);
        g.draggable();
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

    // allow dropping HTML SVG elements on this page
    const pageNode = page.node;
    pageNode.addEventListener("dragover", e => e.preventDefault()); // cancel default behavior so that the browser will let you drop elements onto the page
    pageNode.addEventListener("drop", e => {
        e.preventDefault();
        
        // retrieves data-type from HTML so we can figure out what SVG element to add to the page
        const type = e.dataTransfer.getData("type");

        // Convert mouse coordinates (e.clientX & e.clientY) to SVG coordinates
        const pt = pageNode.createSVGPoint();   // create SVG point
        pt.x = e.clientX;   // set coordinates for the point
        pt.y = e.clientY
        const svgCoords = pt.matrixTransform(pageNode.getScreenCTM().inverse()); // get SVG coords

        if (iconMap[type]) {    // if it exists (later add if it's over a drop-zone)
            iconMap[type](svgCoords.x, svgCoords.y, page);  // create the corresponding SVG
        }
    });

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

addPage();

icons.forEach(icon => {
    icon.addEventListener("dragstart", e => {
        // set value to data-type="" in HTML
        e.dataTransfer.setData("type", icon.dataset.type);
    });
});

// Input areas change on "enter" b/c it's more logical :)
const blurs = document.querySelectorAll(".blur");
blurs.forEach(input => {
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault;
            input.blur();    // blur means "losing focus" so you just exit out of the input box
        }
    });
});

// Adding/Removing Pages
document.getElementById("add-page-btn").addEventListener("click", addPage);
document.getElementById("remove-page-btn").addEventListener("click", removePage);

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
    alert("Sharing functionality currently in progress")
});

var svgData = allPages[0].svg();   // XML
console.log(svgData);
