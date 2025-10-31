const hero = document.querySelector(".hero");

const images = [
    "/public/image/p3.jpg",
    "/public/image/p6.jpg",
    "/public/image/p1.jpg",
    "/public/image/p4.jpg",
    "/public/image/p2.jpg",
    "/public/image/p5.jpg",
];

let index = 0;

function changeBackground() {
    // Remove the "active" class to reset animation
    hero.classList.remove("active");

    // Change the background image
    hero.style.backgroundImage = `url(${images[index]})`;

    // Update index for next image
    index = (index + 1) % images.length;

    // Re-add the "active" class slightly later to trigger the zoom animation
    setTimeout(() => hero.classList.add("active"), 100);
}

// Set the first image
changeBackground();

// Change image every 4 seconds
setInterval(changeBackground, 4000);

