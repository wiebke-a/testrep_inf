const menuItems = [
  { id: 1, name: "Espresso Martini", category: "kaffee", price: 5.5, icon: "☕", color: "#d8c2a6", badge: "Bestseller", description: "Espresso, Vanille und ein Schuss kalten Wassers.", note: "Kaffee" },
  { id: 2, name: "Klimaanic Cold Brew", category: "kalt", price: 4.8, icon: "🧊", color: "#b9c5ae", badge: "Neu", description: "Kalts Bier, Zitrus und eine Prise Küste.", note: "Kalt" },
  { id: 3, name: "Matcha Latte", category: "kaffee", price: 5.2, icon: "🍵", color: "#b5c3a7", badge: "Pimped", description: "Ceremonial Matcha mit Milch und etwas Honig.", note: "Kaffee" },
  { id: 4, name: "Morgen Toast", category: "snack", price: 7.5, icon: "🥑", color: "#c9b99d", badge: "Herzhaft", description: "Sourdough, Avocado, Tomate und Oliven.", note: "Snack" },
  { id: 5, name: "Kürbis Muffin", category: "süß", price: 3.8, icon: "🧁", color: "#d4a878", badge: "Gebacken", description: "Spiced Pumpkin, Zimtriegel und Monche.", note: "Süß" },
  { id: 6, name: "Kaffee Tiramisu", category: "süß", price: 5.9, icon: "🍰", color: "#c6a57a", badge: "Klassiker", description: "Espresso, Mascarpone und eine Schicht Kakao.", note: "Süß" },
  { id: 7, name: "Ahornlatte", category: "kaffee", price: 4.5, icon: "🥛", color: "#d8c7b2", badge: "Heiß", description: "Espresso, Milch und eine flinke Prise Zimt.", note: "Kaffee" },
  { id: 8, name: "Pistazien Smoothie", category: "kalt", price: 6.2, icon: "🥭", color: "#a9bd95", badge: "Erfrisch", description: "Pistazie, Mango, Joghurt und Minze.", note: "Kalt" },
  { id: 9, name: "Käse & Kräuter", category: "snack", price: 6.8, icon: "🧀", color: "#d9b778", badge: "Schmeck", description: "Käse, Kräuter und frisches Brot.", note: "Snack" }
];

const menuGrid = document.querySelector("#menuGrid");
const cartDrawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#overlay");
const cartItems = document.querySelector("#cartItems");
const cartEmpty = document.querySelector("#cartEmpty");
const cartFooter = document.querySelector("#cartFooter");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const toast = document.querySelector("#toast");
const cart = new Map();

function formatPrice(value) {
  return `${value.toFixed(2)} €`;
}

function renderMenu(filter = "alle") {
  const items = filter === "alle" ? menuItems : menuItems.filter(item => item.category === filter);
  menuGrid.innerHTML = items.map(item => `
    <article class="menu-card">
      <div class="card-art" style="background:${item.color}">
        <span class="badge">${item.badge}</span>
        <span class="art-icon" aria-hidden="true">${item.icon}</span>
      </div>
      <div class="card-body">
        <div class="card-title"><h3>${item.name}</h3><strong>${formatPrice(item.price)}</strong></div>
        <p>${item.description}</p>
        <button class="add-button" data-id="${item.id}" type="button">+ Hinzufügen</button>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const item = menuItems.find(menuItem => menuItem.id === id);
  if (!item) return;
  const existing = cart.get(id);
  cart.set(id, existing ? existing + 1 : 1);
  renderCart();
  showToast(`${item.name} hinzugefügt`);
}

function updateQuantity(id, change) {
  const current = cart.get(id) || 0;
  const next = current + change;
  if (next <= 0) cart.delete(id);
  else cart.set(id, next);
  renderCart();
}

function renderCart() {
  const entries = [...cart.entries()];
  const totalItems = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const totalPrice = entries.reduce((sum, [id, quantity]) => sum + menuItems.find(item => item.id === id).price * quantity, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = formatPrice(totalPrice);
  cartEmpty.hidden = entries.length > 0;
  cartFooter.hidden = entries.length === 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const item = menuItems.find(menuItem => menuItem.id === id);
    return `
      <div class="cart-item">
        <div class="cart-item-icon" style="background:${item.color}">${item.icon}</div>
        <div>
          <h3>${item.name}</h3><p>${item.note}</p>
          <div class="quantity">
            <button type="button" data-action="decrease" data-id="${id}" aria-label="Menge verringern">−</button>
            <span>${quantity}</span>
            <button type="button" data-action="increase" data-id="${id}" aria-label="Menge erhöhen">+</button>
          </div>
        </div>
        <div class="cart-item-price">${formatPrice(item.price * quantity)}</div>
      </div>`;
  }).join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

menuGrid.addEventListener("click", event => {
  const button = event.target.closest(".add-button");
  if (button) addToCart(Number(button.dataset.id));
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  updateQuantity(Number(button.dataset.id), button.dataset.action === "increase" ? 1 : -1);
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(filter => filter.classList.remove("active"));
    button.classList.add("active");
    renderMenu(button.dataset.filter);
  });
});

document.querySelector("#cartButton").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });

document.querySelector(".checkout").addEventListener("click", () => {
  showToast("Bestellung wird vorbereitet!");
});

renderMenu();
renderCart();
