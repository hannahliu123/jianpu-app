const container = document.getElementById("sheet-container");
const width = container.clientWidth - 100;
const height = 11*width/8.5;    // based on average paper sizes

function addPage() {
    const svg = SVG().addTo(container).size(width, height);
    svg.rect(width, height).fill("white");
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

const baseNote = page.group();
baseNote.add(page.text("1")).font({ size:"1.25rem" });
baseNote.add(page.circle(5).fill("black").move(4, 0));

var note1 = baseNote.clone().draggable().addTo(page);
var note2 = baseNote.clone().draggable().addTo(page);

var svgData = page.svg();   // XML
console.log(svgData);
