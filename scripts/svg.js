const container = document.getElementById("sheet-container");
const width = container.clientWidth - 100;
const height = 11*width/8.5;    // based on average paper sizes

function addPage() {
    const svg = SVG().addTo(container).size(width, height);
    svg.rect(width, height).fill("white");

    // allow dropping HTML SVG elements on this page
    const pageNode = svg.node;
    pageNode.addEventListener("dragover", e => e.preventDefault()); // cancel default behavior so that the browser will let you drop elements onto the page
    pageNode.addEventListener("drop", e => {
        e.preventDefault();
        alert(e.target);
        
        // retrieves data-type so we can figure out what SVG element to add to the page
        const type = e.dataTransfer.getData("type"); // uhhh wip i need to set this with setData but ill do that another time i need sleep heh

    });

    return svg;
}

const page = addPage();
// const page2 = addPage();

var text = page.text("hello")
    .font({
        size: "1.25rem",    // font-size (number means pixels, use quotes if using units)
        anchor: "middle",   // text alignment
        family: "Arial"
    })
    .move(100, 60)      // x, y
    .draggable().on("dragmove.namespace", (event) => {
        const { handler, box } = event.detail;
        event.preventDefault();
        handler.move(box.x - (box.x % 10), box.y - (box.y % 100));
    });

const baseNote1 = page.group();
baseNote1.add(page.text("1")).font({ size:"1.25rem" });
baseNote1.add(page.circle(5).fill("black").move(4, 0));

const baseNote2 = page.group();
baseNote2.add(page.text("2")).font({ size:"1.25rem" }).move(0, 100);
baseNote2.add(page.circle(5).fill("black").move(4, 100));

var note1 = baseNote1.clone().draggable().addTo(page);
var note2 = baseNote1.clone().draggable().addTo(page);

var svgData = page.svg();   // XML
console.log(svgData);
