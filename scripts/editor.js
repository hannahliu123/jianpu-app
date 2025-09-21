// Sidebar resizing (later)
// also change sidebar section bg color based on what section you're in (kinda like Scratch)

// Jump to section in editor panel
const sections = document.querySelectorAll(".section");
sections.forEach(section => {
    const editPanelContainer = document.getElementById("edit-panel");
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
            e.preventDefault;
            input.blur();    // blur means "losing focus" so you just exit out of the input box
        }
    });
});
