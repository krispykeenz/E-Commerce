// DEMO MODE ONLY: This demo is a static showcase. It does not call any backend services.
// Remove the /demo folder when you publish a real deployment.

const PRODUCTS = [
  { id: 'p1', name: 'Classic Hoodie', price: 49.99, category: 'Apparel' },
  { id: 'p2', name: 'Minimal Sneakers', price: 89.0, category: 'Footwear' },
  { id: 'p3', name: 'Everyday Backpack', price: 64.5, category: 'Accessories' },
  { id: 'p4', name: 'Wireless Earbuds', price: 119.99, category: 'Electronics' },
  { id: 'p5', name: 'Stainless Bottle', price: 24.0, category: 'Accessories' },
  { id: 'p6', name: 'Desk Lamp', price: 39.0, category: 'Home' },
];

const state = {
  category: 'All',
  query: '',
  cart: new Map(), // productId -> qty
};

const els = {
  categorySelect: document.getElementById('categorySelect'),
  searchInput: document.getElementById('searchInput'),
  productGrid: document.getElementById('productGrid'),
  cartList: document.getElementById('cartList'),
  cartCount: document.getElementById('cartCount'),
  cartTotal: document.getElementById('cartTotal'),
  checkoutBtn: document.getElementById('checkoutBtn'),
};

function formatUSD(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function uniqueCategories() {
  return ['All', ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];
}

function filteredProducts() {
  return PRODUCTS.filter((p) => {
    const inCategory = state.category === 'All' || p.category === state.category;
    const inQuery = !state.query || p.name.toLowerCase().includes(state.query.toLowerCase());
    return inCategory && inQuery;
  });
}

function addToCart(productId) {
  const current = state.cart.get(productId) ?? 0;
  state.cart.set(productId, current + 1);
  renderCart();
}

function setQty(productId, nextQty) {
  if (nextQty <= 0) state.cart.delete(productId);
  else state.cart.set(productId, nextQty);
  renderCart();
}

function cartItems() {
  return Array.from(state.cart.entries()).map(([productId, qty]) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    return {
      product,
      qty,
      lineTotal: (product?.price ?? 0) * qty,
    };
  });
}

function cartTotals() {
  const items = cartItems();
  const count = items.reduce((acc, i) => acc + i.qty, 0);
  const total = items.reduce((acc, i) => acc + i.lineTotal, 0);
  return { count, total };
}

function renderCategoryOptions() {
  els.categorySelect.innerHTML = '';
  for (const c of uniqueCategories()) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    if (c === state.category) opt.selected = true;
    els.categorySelect.appendChild(opt);
  }
}

function renderProducts() {
  const products = filteredProducts();
  els.productGrid.innerHTML = '';

  if (!products.length) {
    const empty = document.createElement('div');
    empty.className = 'muted';
    empty.textContent = 'No products match your filters.';
    els.productGrid.appendChild(empty);
    return;
  }

  for (const p of products) {
    const card = document.createElement('div');
    card.className = 'product';

    const title = document.createElement('h3');
    title.textContent = p.name;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${p.category} • ${formatUSD(p.price)}`;

    const actions = document.createElement('div');
    actions.className = 'row';
    actions.style.marginTop = '0.7rem';

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.type = 'button';
    btn.textContent = 'Add to cart';
    btn.addEventListener('click', () => addToCart(p.id));

    actions.appendChild(document.createElement('span'));
    actions.appendChild(btn);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);

    els.productGrid.appendChild(card);
  }
}

function renderCart() {
  const items = cartItems();
  const { count, total } = cartTotals();

  els.cartCount.textContent = `${count} item${count === 1 ? '' : 's'}`;
  els.cartTotal.textContent = formatUSD(total);

  els.cartList.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'muted';
    empty.textContent = 'Your cart is empty.';
    els.cartList.appendChild(empty);
    return;
  }

  for (const { product, qty, lineTotal } of items) {
    const row = document.createElement('div');
    row.className = 'cart-item';

    const left = document.createElement('div');

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = product?.name ?? 'Unknown';

    const line = document.createElement('div');
    line.className = 'line';
    line.textContent = `${formatUSD(product?.price ?? 0)} • ${formatUSD(lineTotal)}`;

    left.appendChild(name);
    left.appendChild(line);

    const qtyEl = document.createElement('div');
    qtyEl.className = 'qty';

    const dec = document.createElement('button');
    dec.type = 'button';
    dec.textContent = '−';
    dec.addEventListener('click', () => setQty(product.id, qty - 1));

    const value = document.createElement('span');
    value.textContent = String(qty);

    const inc = document.createElement('button');
    inc.type = 'button';
    inc.textContent = '+';
    inc.addEventListener('click', () => setQty(product.id, qty + 1));

    qtyEl.appendChild(dec);
    qtyEl.appendChild(value);
    qtyEl.appendChild(inc);

    row.appendChild(left);
    row.appendChild(qtyEl);

    els.cartList.appendChild(row);
  }
}

function wireEvents() {
  els.categorySelect.addEventListener('change', (e) => {
    state.category = e.target.value;
    renderProducts();
  });

  els.searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    renderProducts();
  });

  els.checkoutBtn.addEventListener('click', () => {
    const { count, total } = cartTotals();
    if (!count) {
      alert('Your cart is empty. Add something first.');
      return;
    }

    alert(
      `Demo checkout complete!\n\nItems: ${count}\nTotal: ${formatUSD(total)}\n\n(Real Stripe checkout is disabled in demo mode.)`
    );

    state.cart.clear();
    renderCart();
  });
}

renderCategoryOptions();
wireEvents();
renderProducts();
renderCart();
