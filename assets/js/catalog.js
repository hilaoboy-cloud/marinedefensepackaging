/**
 * Marine Defense Packaging - Product Catalog Filtering & Search
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('#product-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  const resultsCount = document.querySelector('#results-count');

  if (!productCards.length) return;

  let activeCategory = 'all';
  let searchTerm = '';

  function filterProducts() {
    let visibleCount = 0;

    productCards.forEach((card) => {
      const category = card.getAttribute('data-category') || '';
      const title = (card.querySelector('.product-card-title')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.product-card-desc')?.textContent || '').toLowerCase();
      const tags = (card.querySelector('.spec-list')?.textContent || '').toLowerCase();

      const matchesCategory = activeCategory === 'all' || category.includes(activeCategory);
      const matchesSearch = !searchTerm || title.includes(searchTerm) || desc.includes(searchTerm) || tags.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${visibleCount} product category${visibleCount === 1 ? '' : 'ies'}`;
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      filterProducts();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      filterProducts();
    });
  }
});
