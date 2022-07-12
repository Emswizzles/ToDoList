const primaryNav = document.querySelector(".primary-nav");
const navToggle = document.querySelector(".mobile-nav-toggle");

navToggle.addEventListener("click", () => {
    console.log("clicked!");
    const visibility = primaryNav.getAttribute("data-visible");

    // Checking to see if the menu is currently showing on mobile mode or not
    if (visibility === "false"){
        primaryNav.setAttribute("data-visible", "true");
        navToggle.classList.remove("menu-mode");
        navToggle.classList.add("cross-mode");
    } else {
        primaryNav.setAttribute("data-visible", "false");
        navToggle.classList.remove("cross-mode");
        navToggle.classList.add("menu-mode");
    };
});