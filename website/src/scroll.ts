const SCROLL_DURATION = 3000;

document.addEventListener("DOMContentLoaded", () => {
    function isElementInViewport(el: any) {
      const rect = el.getBoundingClientRect();
      const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
      const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (windowHeight + 1) &&  // Allow for rounding errors in Chrome
        rect.right <= (windowWidth + 1)  // Allow for rounding errors in Chrome
    );
    }

    function smoothScrollTo(element: any, duration: any) {
      const start = window.pageYOffset;
      const target = element.getBoundingClientRect().top;
      const startTime = performance.now();

      function step(currentTime: any) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        window.scrollTo({
          top: start + target * easeInOutQuad(progress),
        });

        if (elapsed < duration) {
          window.requestAnimationFrame(step);
        }
      }

      window.requestAnimationFrame(step);
    }

    function easeInOutQuad(t: any) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function getScrollDirection(event: any) {
      return event.deltaY > 0 ? "down" : "up";
    }

    function scrollDown(event: any) {
      event.preventDefault();

      const containers = [
        "title-container",
        "p1-container",
        "p2-container",
        "p3-container",
        "p4-container",
        "p5-container",
        "p6-container",
        "p7-container",
        "p8-container",
        "p9-container",
        "final-container"
      ];

      for (let i = 0; i < containers.length; i++) {
        const upContainer = i >= 1 ? document.getElementById(containers[i - 1]) : null;
        const currentContainer = document.getElementById(containers[i]);
        const downContainer = i < containers.length - 1 ? document.getElementById(containers[i + 1]) : null;

        if (upContainer && isElementInViewport(currentContainer) && getScrollDirection(event) === "up") {
          smoothScrollTo(upContainer, SCROLL_DURATION);
        }

        if (downContainer && isElementInViewport(currentContainer) && getScrollDirection(event) === "down") {
          smoothScrollTo(downContainer, SCROLL_DURATION);
        }
      }
    }

    document.addEventListener("wheel", scrollDown, { passive: false });
    document.addEventListener("touchmove", scrollDown, { passive: false });

    // Scroll to title on page load
    const titleContainer = document.getElementById("title-container");
    smoothScrollTo(titleContainer, 0);
});