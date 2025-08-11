const container = document.getElementById("sheet-container");
const width = container.clientWidth;
const height = 11*width/8.5;    // based on average paper sizes
var draw = SVG().addTo(container).size(width, height)
// set width & height dimensions of canvas to based on container

const pageWidth = width - 0.05*window.innerWidth;
const pageHeight = 11*pageWidth/8.5;
var page = draw.rect(pageWidth, pageHeight)
    .fill("white")
    .move(0.025*window.innerWidth, 0.025*window.innerWidth);

var text = draw.text("hello")
    .font({
        size: "1.25rem",    // font-size (number means pixels, use quotes if using units)
        anchor: "middle",   // text alignment
        family: "Arial"
    }).move(100, 60);       // x, y

text.draggable().on("dragmove.namespace", (event) => {
    const { handler, box } = event.detail;
    event.preventDefault();

    handler.move(box.x - (box.x % 10), box.y - (box.y % 100));
});

const note = draw.group();
note.add(draw.text("1")).font({ size:"1.25rem" });
note.add(draw.circle(5).fill('black').move(4, 0));
note.move(200, 200);
note.draggable();

var svgData = draw.svg();   // XML
console.log(svgData);
