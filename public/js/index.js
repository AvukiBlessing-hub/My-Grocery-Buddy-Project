const hero = document.querySelector(".hero");

const images = [
    "/public/image/p3.jpg",
    "/public/image/p6.jpg",
    "/public/image/p1.jpg",
    "/public/image/p4.jpg",
    "/public/image/p2.jpg",
    "/public/image/p5.jpg",
];

    // hero.classList.remove("active");

   
  

    // Update index for next image
   let index = 0;

   function changeBackground() {
 hero.style.backgroundImage = `url(${images[index]})`;
  index = (index + 1) % images.length;
   }



changeBackground(); // set first image
setInterval(changeBackground, 4000); // change every 4 seconds
