// Track the information/data stored

import { width, defaultMeasureY } from './constants.js';

export let scoreData = {
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

export let selectedTool =  null;
export let isSubtitle = false;
export let isComposer = false;
export let isArranger = false;
export const setTool = (val) => { selectedTool = val; };
export const toggleSubtitle = (val) => { isSubtitle = val; };
export const toggleComposer = (val) => { isComposer = val; };
export const toggleArranger = (val) => { isArranger = val; };

export function getStartY(pageIndex) {
    if (pageIndex > 0) return defaultMeasureY;    // pages other than the first (with header)

    let startY = 0.125;
    if (isSubtitle) startY += 0.04;
    if (isComposer) startY += 0.06;
    if (isArranger) startY += 0.05;

    return startY*width;
}
