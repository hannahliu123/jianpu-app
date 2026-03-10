// Basic setup when the app first loads
import * as State from './state.js';
import * as CONFIG from './constants.js';
import { layoutRerender } from './logic.js';

export function setupEditorUI() {
    // Sidebar resizing (later)
    // also change sidebar section bg color based on what section you're in (kinda like Scratch)

    // Jump to section in editor panel
    const sections = document.querySelectorAll(".section");
    const editPanelContainer = document.getElementById("edit-panel");
    sections.forEach(section => {
        section.addEventListener("click", () => {
            const targetId = section.dataset.target;
            const targetElement = document.getElementById(targetId);
            const target = targetElement.getBoundingClientRect().top + editPanelContainer.scrollTop - 90;
            editPanelContainer.scrollTo({ top: target, behavior: "smooth" });
        });
    });

    // Input areas change on "enter" b/c it's more logical :)
    const blurs = document.querySelectorAll(".blur");
    blurs.forEach(input => {
        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                input.blur();    // blur means "losing focus" so you just exit out of the input box
            }
        });
    });
}

// Set up the header of the sheet music (should only ever be used on first page)
export function setupHeader(page) {
    // Vertical location of composer & arranged
    let yComp = 0.15*CONFIG.pageHeight;
    let yArr = 0.15*CONFIG.pageHeight;
    const pageCenter = CONFIG.width/2;

    // Create the SVG text elements on the page
    const titleText = page.text("Untitled")
        .font({ size: CONFIG.titleSize, family: "Arial" })
        .center(pageCenter, CONFIG.titleY);
    const subtitleText = page.text("None")
        .font({ size: CONFIG.subtitleSize, family: "Arial" })
        .center(pageCenter, CONFIG.subtitleY)
        .attr("visibility", "hidden");
    const compText = page.text("None")
        .font({ size: CONFIG.subtitleSize, family: "Arial" })
        .attr({x: CONFIG.rightAlignX, y: yComp, "text-anchor": "end", "visibility": "hidden"});
    const arrText = page.text("None")
        .font({ size: CONFIG.subtitleSize, family: "Arial" })
        .attr({x: CONFIG.rightAlignX, y: yArr, "text-anchor": "end", "visibility": "hidden"});
    
    // Event listeners for text inputs
    document.getElementById("title-input").addEventListener("input", e => {
        titleText.text(e.target.value).center(pageCenter, CONFIG.titleY);
    });
    document.getElementById("subtitle-input").addEventListener("input", e => {
        subtitleText.text(e.target.value).center(pageCenter, CONFIG.subtitleY);
        State.scoreData.meta.subtitle = e.target.value;
    });
    document.getElementById("composer-input").addEventListener("input", e => {
        compText.text(e.target.value);
        State.scoreData.meta.composer = e.target.value;
    });
    document.getElementById("arranger-input").addEventListener("input", e => {
        arrText.text(e.target.value);
        State.scoreData.meta.arranger = e.target.value;
    });

    // Checkbox logic (+visibility and vertical shifts)
    const subtitleCheck = document.getElementById("subtitle-checkbox");
    subtitleCheck.addEventListener("change", () => {
        const isVisible = subtitleCheck.checked;
        State.toggleSubtitle(isVisible);
        subtitleText.attr("visibility", (isVisible ? "visible" : "hidden"));

        const shift = 0.02 * CONFIG.pageHeight;
        yComp += (isVisible ? shift : -shift);
        yArr += (isVisible ? shift : -shift);
        compText.y(yComp);
        arrText.y(yArr);
        layoutRerender(State.scoreData, 0);
    });

    const compCheck = document.getElementById("composer-checkbox");
    compCheck.addEventListener("change", () => {
        const isVisible = compCheck.checked;
        State.toggleComposer(isVisible);
        compText.y(yComp).attr("visibility", (isVisible ? "visible" : "hidden"));

        const shift = 0.025 * CONFIG.pageHeight;
        yArr += (isVisible ? shift : -shift);
        arrText.y(yArr);
        layoutRerender(State.scoreData, 0);
    });

    const arrCheck = document.getElementById("arranger-checkbox");
    arrCheck.addEventListener("change", () => {
        const isVisible = arrCheck.checked;
        State.toggleArranger(isVisible);
        arrText.y(yArr).attr("visibility", (isVisible ? "visible" : "hidden"));

        layoutRerender(State.scoreData, 0);
    });
}
