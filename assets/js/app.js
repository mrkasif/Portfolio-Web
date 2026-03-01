const panels = Array.from(document.querySelectorAll(".panel"));
const stack = document.getElementById("app");
let activeIndex = 0;
let busy = false;

const projects = [
  { name: "COLLEGE NOTES WEB", tag: "Live", href: "https://mrkasif.github.io/College-Notes-Web/" },
  { name: "PAGES OF THE PAST WEB", tag: "Live", href: "https://mrkasif.github.io/pages-of-the-past-web/" }
];

const projectGrid = document.getElementById("project-grid");
const visionTextEl = document.getElementById("vision-text");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
let visionTyped = false;
let projectOrbitDesktop = window.innerWidth > 900;

function renderProjectGrid() {
  if (!projectGrid) return;
  projectGrid.innerHTML = "";
  const useOrbitTrack = window.innerWidth > 900;
  const orbitCycles = useOrbitTrack ? 2 : 1;
  const loopedProjects = Array.from({ length: orbitCycles }, () => projects).flat();
  const track = document.createElement("div");
  track.className = "project-orbit-track";
  projectGrid.classList.toggle("is-orbiting", useOrbitTrack);

  loopedProjects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-window";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${project.name}`);

    const preview = document.createElement("div");
    preview.className = "project-preview";
    preview.innerHTML = `<span class="project-preview-text">${project.name}</span>`;

    const meta = document.createElement("div");
    meta.className = "project-meta";
    meta.innerHTML = `<span class="project-name">${project.name}</span><span class="project-tag">${project.tag}</span>`;

    const open = () => window.open(project.href, "_blank", "noopener,noreferrer");
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });

    card.append(preview, meta);
    track.appendChild(card);
  });

  projectGrid.appendChild(track);
}

function applyProjectTilt() {
  return;
}

function moveTo(index) {
  if (window.innerWidth <= 900) return;
  if (busy || index < 0 || index >= panels.length) return;

  busy = true;
  activeIndex = index;
  stack.style.transform = `translateY(-${index * 100}vh)`;

  panels.forEach((panel, i) => {
    panel.classList.toggle("active", i === index);
  });

  const activePanel = panels[index];
  if (activePanel && activePanel.id === "vision") {
    startVisionTyping();
  }

  window.setTimeout(() => {
    busy = false;
  }, 850);
}

function startVisionTyping() {
  if (!visionTextEl || visionTyped) return;
  const fullText = visionTextEl.dataset.text || "";
  let pos = 0;
  visionTyped = true;
  visionTextEl.textContent = "";

  const timer = window.setInterval(() => {
    visionTextEl.textContent += fullText[pos] || "";
    pos += 1;
    if (pos >= fullText.length) {
      window.clearInterval(timer);
    }
  }, 12);
}

function step(dir) {
  moveTo(activeIndex + dir);
}

function goToPanel(panelId) {
  const index = panels.findIndex((panel) => panel.id === panelId);
  if (index >= 0) moveTo(index);
}

document.addEventListener(
  "wheel",
  (event) => {
    if (window.innerWidth <= 900) return;
    if (Math.abs(event.deltaY) < 10) return;
    step(event.deltaY > 0 ? 1 : -1);
  },
  { passive: true }
);

document.addEventListener("keydown", (event) => {
  if (window.innerWidth <= 900) return;
  if (event.key === "ArrowDown") step(1);
  if (event.key === "ArrowUp") step(-1);
});

document.querySelectorAll(".panel-hint").forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.getAttribute("data-dir") === "down" ? 1 : -1;
    step(dir);
  });
});

document.querySelector(".contact-link")?.addEventListener("click", (event) => {
  if (window.innerWidth <= 900) return;
  event.preventDefault();
  goToPanel("contact");
});

document.querySelector(".back-link")?.addEventListener("click", (event) => {
  if (window.innerWidth <= 900) return;
  event.preventDefault();
  goToPanel("about-me");
});

document.querySelectorAll(".top-nav [data-panel]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (window.innerWidth <= 900) return;
    event.preventDefault();
    const panelId = link.getAttribute("data-panel");
    if (!panelId) return;
    goToPanel(panelId);
  });
});

document.querySelectorAll("[data-open]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const targetId = trigger.getAttribute("data-open");
    const target = document.getElementById(targetId);
    if (!target) return;
    const isHidden = target.classList.toggle("hidden");
    trigger.textContent = isHidden ? "CLICK TO OPEN" : "CLOSE";
  });
});

const orbZone = document.querySelector(".cursor-orb-zone");
const trail = document.getElementById("cursor-trail");
const balls = [];
const trailCount = 8;

if (orbZone && trail) {
  for (let i = 0; i < trailCount; i += 1) {
    const ball = document.createElement("span");
    ball.className = "trail-ball";
    trail.appendChild(ball);
    balls.push({ el: ball, x: 0, y: 0 });
  }

  orbZone.addEventListener("mousemove", (event) => {
    const rect = orbZone.getBoundingClientRect();
    const targetX = event.clientX - rect.left;
    const targetY = event.clientY - rect.top;

    balls.forEach((ball, idx) => {
      const ease = 0.24 - idx * 0.011;
      ball.x += (targetX - ball.x) * Math.max(0.06, ease);
      ball.y += (targetY - ball.y) * Math.max(0.06, ease);
      ball.el.style.left = `${ball.x}px`;
      ball.el.style.top = `${ball.y}px`;
      ball.el.style.opacity = `${1 - idx / trailCount}`;
    });
  });
}

if (window.innerWidth <= 900 && visionTextEl) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        startVisionTyping();
        observer.disconnect();
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(visionTextEl);
}

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!formStatus) return;
  formStatus.textContent = "Sending...";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) throw new Error("submit failed");
    formStatus.textContent = "Message sent successfully.";
    contactForm.reset();
  } catch {
    formStatus.textContent = "Failed to send. Please try again.";
  }
});

renderProjectGrid();
applyProjectTilt();

window.addEventListener("resize", () => {
  const isDesktop = window.innerWidth > 900;
  if (isDesktop === projectOrbitDesktop) return;
  projectOrbitDesktop = isDesktop;
  renderProjectGrid();
  applyProjectTilt();
});
