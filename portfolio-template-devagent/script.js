function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

function initRevealObserver() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => observer.observe(el));
}

function initSkillsWheel() {
  const skillsSection = document.getElementById('skills');
  const wheel = skillsSection?.querySelector('.skills-wheel');

  if (!wheel || !skillsSection) return;

  const updateRotation = () => {
    const sectionTop = skillsSection.offsetTop;
    const sectionHeight = skillsSection.offsetHeight;
    const start = sectionTop - window.innerHeight * 0.7;
    const end = sectionTop + sectionHeight - window.innerHeight * 0.2;
    const progress = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start || 1)));
    wheel.style.setProperty('--wheel-rotation', `${progress * 360}deg`);
  };

  window.addEventListener('scroll', updateRotation, { passive: true });
  window.addEventListener('resize', updateRotation);
  updateRotation();
}

function initNavigation() {
  const nav = document.querySelector('nav');
  const links = document.querySelectorAll('.nav-links a');
  const sections = Array.from(document.querySelectorAll('section[id], #hero'));

  const setActiveLink = () => {
    const scrollPosition = window.scrollY + 140;
    let currentId = '#hero';

    sections.forEach((section) => {
      const id = `#${section.id}`;
      if (section.offsetTop <= scrollPosition) {
        currentId = id;
      }
    });

    links.forEach((link) => {
      const isActive = link.getAttribute('href') === currentId;
      link.classList.toggle('active', isActive);
    });
  };

  const handleScroll = () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
    setActiveLink();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function initHeroTilt() {
  const visual = document.querySelector('.hero-visual-frame');
  if (!visual) return;

  const resetTilt = () => {
    visual.style.setProperty('--rotate-x', '0deg');
    visual.style.setProperty('--rotate-y', '0deg');
  };

  visual.addEventListener('pointermove', (event) => {
    const bounds = visual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    visual.style.setProperty('--rotate-y', `${x * 8}deg`);
    visual.style.setProperty('--rotate-x', `${y * -8}deg`);
  });

  visual.addEventListener('pointerleave', resetTilt);
}

function sendContactEmail(event) {
  event.preventDefault();
  const form = event.target;
  const fromEmail = form.from_email.value.trim();
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();
  if (!fromEmail || !subject || !message) return false;

  const statusEl = document.getElementById('form-status');
  const btn = form.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Sending...';
  statusEl.textContent = '';

  const templateParams = {
    from_email: fromEmail,
    subject: subject,
    message: message
  };

  emailjs.send('service_lygvgw4', 'template_qp4t65g', templateParams, 'HNfEh15wOD-NHTosq')
    .then(() => {
      statusEl.textContent = 'Message sent successfully!';
      statusEl.style.color = 'green';
      form.reset();
    })
    .catch((error) => {
      console.error('EmailJS Error:', error);
      statusEl.textContent = 'Failed to send message. Please try again.';
      statusEl.style.color = 'red';
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    });

  return false;
}

window.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initRevealObserver();
  initSkillsWheel();
  initNavigation();
  initHeroTilt();

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', sendContactEmail);
  }
});