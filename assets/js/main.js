/**
 * Marine Defense Packaging - Client-side Interactive Logic
 * Lightweight, accessible, no external dependencies.
 */

/* ============================================================
 * RFQ / contact form submission configuration.
 * FORM_ENDPOINT: address the form data is POSTed to.
 * Standard Formspree free-tier integration: register at
 * https://formspree.io, create a form, and paste the endpoint
 * below, e.g. 'https://formspree.io/f/xxxxabcd'.
 * TODO: Replace YOUR_FORM_ID with the real Formspree form ID
 * (register at formspree.io, then paste the ID here). Until a
 * verified endpoint is configured, the form will NOT fake a
 * success: visitors are told to email sales instead.
 * ============================================================ */
const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
const SALES_EMAIL = 'sales@marinedefensepackaging.com';

// True only when a real, verified endpoint is configured.
// A placeholder ID (YOUR_FORM_ID) counts as NOT configured,
// so no request is ever sent to an invalid address.
function isFormEndpointConfigured() {
  return Boolean(FORM_ENDPOINT) && FORM_ENDPOINT.indexOf('YOUR_FORM_ID') === -1;
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initRfqModal();
  initDynamicYear();
  initContactForm();
  initCardClickDelegation();
});

// ---------- Product Card Click Delegation ----------
function initCardClickDelegation() {
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    if (e.target.closest('a, button, input, textarea, select, [data-open-rfq]')) return;
    const primaryLink = card.querySelector('a[href]:not([data-open-rfq])');
    if (primaryLink && primaryLink.href) {
      primaryLink.click();
    }
  });
}

// ---------- Mobile Navigation ----------
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const backdrop = document.querySelector('.mobile-backdrop');
  const closeBtn = document.querySelector('.mobile-nav-close');

  if (!toggleBtn || !mobileNav || !backdrop) return;

  function openMenu() {
    mobileNav.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    toggleBtn.setAttribute('aria-expanded', 'true');
    const firstLink = mobileNav.querySelector('.mobile-nav-link');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    mobileNav.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  backdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      closeMenu();
    }
  });
}

// ---------- RFQ Modal ----------
function initRfqModal() {
  const modal = document.querySelector('#rfq-modal');
  if (!modal) return;

  const openBtns = document.querySelectorAll('[data-open-rfq]');
  const closeBtns = modal.querySelectorAll('.modal-close, [data-close-modal]');
  const productInput = modal.querySelector('#rfq-product');
  const rfqForm = modal.querySelector('#rfq-form');
  const statusBox = modal.querySelector('#rfq-status');
  let lastTrigger = null;

  function openRfq(productName = '', trigger = null) {
    lastTrigger = trigger;
    if (productInput && productName) {
      productInput.value = productName;
    }
    setFormStatus(statusBox, '', '');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstField = modal.querySelector('#rfq-name');
    if (firstField) firstField.focus();
  }

  function closeRfq() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.getAttribute('data-rfq-product') || '';
      openRfq(product, btn);
    });
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener('click', closeRfq);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeRfq();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeRfq();
    }
  });

  // Keep tab focus inside the modal while it is open
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !modal.classList.contains('open')) return;
    const focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const list = Array.from(focusables).filter((el) => !el.disabled);
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  if (rfqForm) {
    rfqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitLeadForm(rfqForm, statusBox, 'RFQ');
    });
  }
}

// ---------- Contact page form ----------
function initContactForm() {
  const contactForm = document.querySelector('#contact-form');
  if (!contactForm) return;

  let statusBox = contactForm.querySelector('.form-status');
  if (!statusBox) {
    statusBox = document.createElement('div');
    statusBox.className = 'form-status';
    statusBox.setAttribute('role', 'status');
    statusBox.setAttribute('aria-live', 'polite');
    contactForm.prepend(statusBox);
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitLeadForm(contactForm, statusBox, 'Inquiry');
  });
}

// ---------- Honest form submission ----------
// If FORM_ENDPOINT is configured, POST the data there and report real
// success/failure. If not configured, never fake a success: tell the
// visitor to email sales directly instead.
async function submitLeadForm(form, statusBox, kind) {
  // Native HTML5 validation: both the RFQ form and the contact form use
  // required/email attributes (novalidate has been removed from #rfq-form).
  // Stop here and let the browser surface field errors instead of
  // submitting incomplete data.
  if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const submitBtn = form.querySelector('[type="submit"]');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  if (!isFormEndpointConfigured()) {
    setFormStatus(
      statusBox,
      'error',
      'Online form submission is not connected yet. ' +
        'Please email your ' + kind.toLowerCase() + ' directly to ' +
        '<a href="mailto:' + SALES_EMAIL + '">' + SALES_EMAIL + '</a> ' +
        'and our team will respond promptly.'
    );
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.dataset.label = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
  }
  setFormStatus(statusBox, '', '');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ form_kind: kind, page: location.href }, data)),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error('HTTP ' + res.status);

    setFormStatus(
      statusBox,
      'success',
      'Thank you. Your ' + kind.toLowerCase() + ' has been sent successfully. ' +
        'Our defense packaging specialist will contact you within 24 hours.'
    );
    form.reset();
  } catch (err) {
    setFormStatus(
      statusBox,
      'error',
      'Sorry, the submission failed (' + (err && err.name === 'AbortError' ? 'timeout' : 'network error') + '). ' +
        'Please try again or email us directly at ' +
        '<a href="mailto:' + SALES_EMAIL + '">' + SALES_EMAIL + '</a>.'
    );
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.label || submitBtn.textContent;
    }
  }
}

function setFormStatus(box, type, html) {
  if (!box) return;
  box.className = 'form-status' + (type ? ' ' + type + ' show' : '');
  box.innerHTML = html;
}

// ---------- Dynamic year ----------
function initDynamicYear() {
  document.querySelectorAll('.current-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

// ---------- Toast notification ----------
function showToast(message, duration = 5000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }

  toast.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>' +
    '<polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' +
    '<span>' + message + '</span>';

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Expose globally for inline scripts / triggers
window.showToast = showToast;
