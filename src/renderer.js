// Render VISUAL elements from stored data/state

import { SVG } from '@svgdotjs/svg.js';
import * as CONFIG from './constants.js';

// measureGroup is an svg reference to the measure group that we want to insert item into
export function createItem(item, measureGroup) {    // create an svg for item
    const itemGroup = measureGroup.group().id(item.id);
    const data = CONFIG.itemData[item.type];

    if (item.type === 'bar') {
        itemGroup.line(0, 0, 0, CONFIG.measureHeight)   // bar with top left at (0,0)
            .stroke({ width: CONFIG.barWidth, color: "black" });
        itemGroup.rect(CONFIG.barSpace, CONFIG.measureHeight)
            .fill("transparent")
            .cx(0); // center .cx(), not just .x() b/c it's centered
    } else {
        itemGroup.text(data.icon)
            .font({ size: CONFIG.noteSize, family: "Arial" })
            .center(0, CONFIG.measureHeight / 2);
        itemGroup.rect(CONFIG.noteSize, CONFIG.measureHeight)
            .fill("transparent")
            .center(0, CONFIG.measureHeight / 2)
            .back();
    }

    return itemGroup;
}

export function createMeasure(measure, page) {
    const group = page.group()
        .addClass("measure-group")
        .id(measure.id);
    
    return group;
}

// measure is the data (not svg)
export function renderMeasure(measure) {
    if (!measure.svgGroup) return;

    const musicLayer = SVG('#music-layer');
    let pageGroup = musicLayer.findOne(`#page-${measure.pageIndex}`);
    if (!pageGroup) {   // page doesn't exist yet
        pageGroup = createPageGroup(measure.pageIndex, musicLayer);
    }

    // .addTo() automatically removes it from the old page
    measure.svgGroup.addTo(pageGroup);
    measure.svgGroup.move(measure.x, measure.y);
}

export function createPageGroup(pageIndex, container) {
    const yOffset = pageIndex * (CONFIG.pageHeight + CONFIG.pageSpace);
    const canvas = container.parent();

    console.log("NEW PAGE at index '" + pageIndex + "' with y offset: " + yOffset + " in container " + container);   // debugging
    console.log(container);

    const pageGroup = container.group()
        .id(`page-${pageIndex}`)
        .translate(0, yOffset); // move is unreliabel for groups!
    
    pageGroup.rect(CONFIG.width, CONFIG.pageHeight)
        .fill("white")
        .stroke({ color: "#ccc", width: 0.25 })
        .back();

    // expand SVG canvas height (fixed) so we can scroll to the new page
    const newHeight = yOffset + CONFIG.pageHeight + CONFIG.pageSpace;
    canvas.size(CONFIG.screenWidth, newHeight);     // canvas svg
    canvas.viewbox(-CONFIG.autoMargin, -CONFIG.autoMargin, CONFIG.screenWidth, newHeight);

    // ⭐⭐ change later? set viewbox to the created page? 

    return pageGroup;
}
