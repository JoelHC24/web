// main.js - Tu script unificado para todo el sitio XIBALBA

// --- 1. IMPORTACIONES DE FIREBASE ---
// Al tener "imports", este archivo se trata automáticamente como un módulo.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// --- 2. CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDuDpTErqoj4r6OZ9eKtrk8NrBiQ2uoKNo",
    authDomain: "xibalba-53737.firebaseapp.com",
    projectId: "xibalba-53737",
    storageBucket: "xibalba-53737.appspot.com",
    messagingSenderId: "962449294931",
    appId: "1:962449294931:web:5819c122ceac8fe5f268a6",
    measurementId: "G-QPX9XKZFLM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null; // Variable global para saber quién está logueado

// --- 3. LÓGICA PRINCIPAL (SE EJECUTA CUANDO EL HTML ESTÁ LISTO) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Primero, encontramos el placeholder del navbar
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    
    // Si no hay placeholder, no hacemos nada (por si acaso)
    if (!navbarPlaceholder) {
        console.error("No se encontró #navbar-placeholder. El script no puede continuar.");
        return;
    }

    // Cargamos el HTML del navbar
    fetch('navbar.html')
        .then(response => response.text())
        .then(html => {
            // 1. Inyectamos el HTML del navbar
            navbarPlaceholder.innerHTML = html;

            // 2. AHORA SÍ: Ejecutamos toda la lógica que DEPENDE del navbar y la página
            runGlobalLogic();
            runPageSpecificLogic();
        })
        .catch(error => {
            console.error('Error al cargar el navbar:', error);
            navbarPlaceholder.innerHTML = '<p style="color:red; text-align:center;">Error al cargar el menú.</p>';
        });
});

/**
 * Contiene toda la lógica que se debe ejecutar en TODAS las páginas
 * (autenticación, botones del navbar, modales, etc.)
 */
/**
 * Contiene toda la lógica que se debe ejecutar en TODAS las páginas
 * (autenticación, botones del navbar, modales, etc.)
 */
function runGlobalLogic() {
    
    // --- LÓGICA DE AUTENTICACIÓN (onAuthStateChanged) ---
    // (Selectores de ESCRITORIO)
    const accountBtnText = document.getElementById('account-btn-text');
    const loggedOutMenu = document.getElementById('logged-out-menu');
    const loggedInMenu = document.getElementById('logged-in-menu');
    // (Selectores de PANEL MÓVIL)
    const cuentaLoggedOutNav = document.getElementById('cuenta-logged-out');
    const cuentaLoggedInNav = document.getElementById('cuenta-logged-in');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Usuario HA INICIADO SESIÓN
            currentUser = user;
            const userDocRef = doc(db, "usuarios", user.uid);
            const docSnap = await getDoc(userDocRef);
            if (accountBtnText) {
                accountBtnText.textContent = docSnap.exists() ? docSnap.data().nombre : "Usuario";
            }
            loggedInMenu?.classList.remove('hidden');
            loggedOutMenu?.classList.add('hidden');
            cuentaLoggedInNav?.classList.remove('hidden');
            cuentaLoggedOutNav?.classList.add('hidden');
        } else {
            // Usuario NO HA INICIADO SESIÓN
            currentUser = null;
            if (accountBtnText) {
                accountBtnText.textContent = "Cuenta";
            }
            loggedInMenu?.classList.add('hidden');
            loggedOutMenu?.classList.remove('hidden');
            cuentaLoggedInNav?.classList.add('hidden');
            cuentaLoggedOutNav?.classList.remove('hidden');
        }
    });

    // --- LÓGICA DE BOTONES DEL NAVBAR ---
    
    // Controles de ESCRITORIO
    const accountBtn = document.querySelector('.account-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const logoutLink = document.getElementById('logout-link'); // Logout de Escritorio

    // Controles MÓVILES (NUEVA LÓGICA)
    const menuToggle = document.querySelector('.menu-toggle'); // Botón Hamburguesa
    const mobileNavContainer = document.querySelector('.mobile-nav-container'); // El contenedor padre
    const closeBtn = document.querySelector('.close-btn'); // Botón 'X'
    const mobileNavCuentaBtn = document.getElementById('mobile-nav-cuenta-btn'); // Botón "Cuenta"
    const cuentaNavBackBtn = document.getElementById('cuenta-nav-back-btn'); // Botón "Atrás"

    // Abrir/Cerrar MENÚ MÓVIL COMPLETO
    menuToggle?.addEventListener('click', () => mobileNavContainer?.classList.add('active'));
    closeBtn?.addEventListener('click', () => {
        mobileNavContainer?.classList.remove('active');
        // Resetea al menú principal por si acaso
        setTimeout(() => {
            mobileNavContainer?.classList.remove('cuenta-open'); 
        }, 400); // Espera a que termine la anim. de cierre
    });

    // Lógica de PUSH (Panel Principal <-> Panel Cuenta)
    mobileNavCuentaBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mobileNavContainer?.classList.add('cuenta-open'); // Muestra panel cuenta
    });

    cuentaNavBackBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        mobileNavContainer?.classList.remove('cuenta-open'); // Oculta panel cuenta
    });

    // Lógica del Dropdown de Escritorio (sin cambios)
    accountBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownContent?.classList.toggle('show');
    });
    logoutLink?.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).catch((error) => console.error("Error al cerrar sesión:", error));
    });
    window.addEventListener('click', (event) => {
        if (dropdownContent && accountBtn && !accountBtn.contains(event.target)) {
            dropdownContent.classList.remove('show');
        }
    });

    // --- LÓGICA DE MODALES (Abrir y cerrar) ---
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');

    // Botones de Escritorio
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    
    // Botones del Panel Móvil de Cuenta
    const cuentaLoginLink = document.getElementById('cuenta-login-link');
    const cuentaSignupLink = document.getElementById('cuenta-signup-link');
    const cuentaLogoutLink = document.getElementById('cuenta-logout-link');

    // Listeners de Escritorio
    loginLink?.addEventListener('click', (e) => { e.preventDefault(); loginModal?.classList.remove('modal-hidden'); });
    signupLink?.addEventListener('click', (e) => { e.preventDefault(); signupModal?.classList.remove('modal-hidden'); });

    // Listeners del Panel Móvil (AHORA CIERRAN TODO EL MENÚ)
    cuentaLoginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        mobileNavContainer?.classList.remove('active'); // Cierra el panel
        loginModal?.classList.remove('modal-hidden'); // Abre el modal
        setTimeout(() => { mobileNavContainer?.classList.remove('cuenta-open'); }, 400); // Resetea
    });
    cuentaSignupLink?.addEventListener('click', (e) => {
        e.preventDefault();
        mobileNavContainer?.classList.remove('active'); // Cierra el panel
        signupModal?.classList.remove('modal-hidden'); // Abre el modal
        setTimeout(() => { mobileNavContainer?.classList.remove('cuenta-open'); }, 400); // Resetea
    });
    cuentaLogoutLink?.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).catch((error) => console.error("Error al cerrar sesión:", error));
        mobileNavContainer?.classList.remove('active'); // Cierra el panel
        setTimeout(() => { mobileNavContainer?.classList.remove('cuenta-open'); }, 400); // Resetea
    });

    // Lógica para Cerrar CUALQUIER modal (sin cambios)
    document.querySelectorAll('.modal-container').forEach(modal => {
        const closeModalBtn = modal.querySelector('.modal-close-btn');
        const modalOverlay = modal.querySelector('.modal-overlay');
        const closeModal = () => modal.classList.add('modal-hidden');
        closeModalBtn?.addEventListener('click', closeModal);
        modalOverlay?.addEventListener('click', closeModal);
    });

    // --- LÓGICA DE TOGGLE DE CONTRASEÑA (Global) ---
    // (Sin cambios)
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const passwordInput = toggle.previousElementSibling;
            passwordInput.type = (passwordInput.type === 'password') ? 'text' : 'password';
            toggle.textContent = (passwordInput.type === 'password') ? '👁️' : '🙈';
        });
    });

    // --- LÓGICA DE FORMULARIOS (Login y Signup) ---
    // (Sin cambios, asumiendo que ya los tenías)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            try {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Inicio de sesión exitoso. ¡Bienvenido de vuelta!");
                loginForm.reset();
                loginModal?.classList.add('modal-hidden');
            } catch (error) {
                console.error("Error al iniciar sesión:", error.code);
                alert('El correo o la contraseña son incorrectos.');
            }
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const [nombre, apellidos, email, numero, password, confirmPassword, direccion, referencia] = 
                [...e.target.elements].map(el => el.value);
            if (password !== confirmPassword) {
                return alert("Error: Las contraseñas no coinciden.");
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "usuarios", userCredential.user.uid), {
                    nombre, apellidos, email, telefono: numero, direccion, referencia, fechaDeCreacion: new Date()
                });
                alert('¡Cuenta creada con éxito! Bienvenido a XIBALBA.');
                signupForm.reset();
                signupModal?.classList.add('modal-hidden');
            } catch (error) {
                console.error("Error al crear la cuenta:", error);
                if (error.code === 'auth/email-already-in-use') alert('Error: Este correo ya está registrado.');
                else if (error.code === 'auth/weak-password') alert('Error: La contraseña debe tener al menos 6 caracteres.');
                else alert('Ocurrió un error al crear la cuenta.');
            }
        });
    }
}

/**
 * Contiene lógica que SÓLO se debe ejecutar en páginas específicas.
 * Usamos 'if' para detectar en qué página estamos.
 */
function runPageSpecificLogic() {

    // --- LÓGICA PARA PÁGINA DE PRODUCTO (index.html) ---
    const productTitle = document.getElementById('product-title');
    if (productTitle) {
        // Estamos en la página del producto (index.html)
        
        // Lógica de "Añadir al carrito"
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        addToCartBtn?.addEventListener('click', async () => {
            if (!currentUser) {
                alert("Por favor, inicia sesión o crea una cuenta para añadir productos.");
                loginModal?.classList.remove('modal-hidden'); // Abrimos el modal de login
                return;
            }
            const pedido = {
                producto: document.getElementById('product-title').textContent,
                precio: document.getElementById('product-price').textContent,
                cantidad: parseInt(document.querySelector('.qty-display').textContent),
                fecha: new Date()
            };
            try {
                await addDoc(collection(db, "pedidos", currentUser.uid, "ordenes"), pedido);
                alert(`"${pedido.producto}" fue añadido a tus pedidos. ¡Gracias!`);
            } catch (error) {
                console.error("Error al añadir el pedido: ", error);
                alert("Hubo un problema al procesar tu pedido.");
            }
        });

        // Lógica de cambio de sabor (flavors)
        const flavors = {
            vainilla: { name: "FRAPPE DE NUEZ", price: "MX$60.00", description: "Disfruta de la mezcla perfecta...", image: "images/Frappe.png", color: "var(--color-light-brown)"},
            chocolate: { name: "FRAPPE DE CHOCOLATE", price: "MX$65.00", description: "Una deliciosa combinación...", image: "https://i.imgur.com/2mJzQZz.png", color: "var(--color-chocolate)"},
            caramelo: { name: "FRAPPE DE CARAMELO", price: "MX$65.00", description: "El dulce y suave sabor...", image: "https://i.imgur.com/gY9P9oE.png", color: "var(--color-caramel)"}
        };
        const optionItems = document.querySelectorAll('.option-item');
        const productElements = {
            mainImage: document.getElementById('main-frappe-image'),
            mobileImage: document.getElementById('mobile-frappe-image'),
            decorativeCircle: document.getElementById('decorative-circle'),
            mobileDecorativeCircle: document.getElementById('mobile-decorative-circle'),
            title: document.getElementById('product-title'),
            price: document.getElementById('product-price'),
            description: document.getElementById('product-description')
        };
        
        const changeProduct = (flavorKey) => {
            const flavor = flavors[flavorKey];
            if (!flavor) return;
            productElements.mainImage.classList.add('changing');
            productElements.mobileImage.classList.add('changing');
            setTimeout(() => {
                productElements.title.textContent = flavor.name;
                productElements.price.textContent = flavor.price;
                productElements.description.textContent = flavor.description;
                productElements.mainImage.src = flavor.image;
                productElements.mobileImage.src = flavor.image;
                productElements.decorativeCircle.style.backgroundColor = flavor.color;
                productElements.mobileDecorativeCircle.style.backgroundColor = flavor.color;
                productElements.mainImage.classList.remove('changing');
                productElements.mobileImage.classList.remove('changing');
            }, 200);
        };
        
        optionItems.forEach(item => {
            item.addEventListener('click', () => {
                optionItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                changeProduct(item.dataset.flavor);
            });
        });
    }

    // --- LÓGICA PARA PÁGINA DE MENÚ (menu.html) ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Estamos en la página de menú
        const products = [
             { name: 'Nachos', price: 100.00, description: 'Disfruta de la mezcla perfecta de maíz, creando un platillo cremoso y refrescante que te encantará.', category: 'desayunos', categoryDisplay: 'Desayuno', image: 'https://images.pexels.com/photos/10173612/pexels-photo-10173612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
             { name: 'Chilaquiles', price: 95.00, description: 'Totopos de maíz bañados en salsa roja o verde, con queso, crema y cebolla.', category: 'desayunos', categoryDisplay: 'Desayuno', image: 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
             { name: 'Hot Cakes', price: 80.00, description: 'Esponjosos y dorados, servidos con miel de maple y mantequilla.', category: 'desayunos', categoryDisplay: 'Desayuno', image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
             { name: 'Bruschetta', price: 85.00, description: 'Pan tostado con tomates frescos, ajo, albahaca y aceite de oliva.', category: 'cenas', categoryDisplay: 'Cena', image: 'https://images.pexels.com/photos/1437318/pexels-photo-1437318.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
             { name: 'Latte Art', price: 60.00, description: 'Un espresso perfectamente extraído con leche vaporizada y arte.', category: 'bebidas', categoryDisplay: 'Bebida', image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }
        ];

        const sortOptions = document.getElementById('sortOptions');
        const menuGrid = document.querySelector('.menu-grid');
        const resultsCountEl = document.getElementById('results-count');
        const categoryFiltersContainer = document.getElementById('category-filters');
        const minPriceInput = document.getElementById('min-price');
        const maxPriceInput = document.getElementById('max-price');
        const categories = [ { id: 'recomendados', name: 'Recomendados' }, { id: 'all', name: 'Todos' }, { id: 'desayunos', name: 'Desayunos' }, { id: 'cenas', name: 'Cenas' }, { id: 'bebidas', name: 'Bebidas' } ];
        
        function setupCategoryButtons() {
            if (!categoryFiltersContainer) return;
            categoryFiltersContainer.innerHTML = '';
            categories.forEach(cat => {
                const count = getCategoryCount(cat.id);
                const button = document.createElement('button');
                button.className = 'filter-btn';
                button.dataset.category = cat.id;
                button.innerHTML = `<span>${cat.name}</span><span class="filter-count">${count}</span>`;
                categoryFiltersContainer.appendChild(button);
            });
            categoryFiltersContainer.querySelector('.filter-btn')?.classList.add('active-filter');
            
            document.querySelectorAll('#category-filters .filter-btn').forEach(button => {
                button.addEventListener('click', function() {
                    document.querySelectorAll('#category-filters .filter-btn').forEach(btn => btn.classList.remove('active-filter'));
                    this.classList.add('active-filter');
                    updateMenuDisplay();
                });
            });
        }

        function getCategoryCount(categoryId) {
            if (categoryId === 'all' || categoryId === 'recomendados') return products.length;
            return products.filter(p => p.category === categoryId).length;
        }

        function createProductCard(product) {
            return `
                <div class="product-card">
                    <div class="card-img-container">
                        <img src="${product.image}" alt="${product.name}">
                        <h3 class="product-name">${product.name}</h3>
                    </div>
                    <div class="card-content">
                        <div class="card-meta">
                            <span class="product-category-tag">${product.categoryDisplay}</span>
                            <span class="product-price">MX$${product.price.toFixed(2)}</span>
                        </div>
                        <p class="product-description_menu">${product.description}</p>
                    </div>
                </div>`;
        }

        function updateMenuDisplay() {
            const activeCategoryBtn = document.querySelector('#category-filters .active-filter');
            if (!activeCategoryBtn) return; // Salir si los filtros no están listos
            
            const activeCategory = activeCategoryBtn.dataset.category;
            const minPrice = parseFloat(minPriceInput.value) || 0;
            const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
            const searchTerm = searchInput.value.toLowerCase();
            const sortValue = sortOptions.value;
            const currentHour = new Date().getHours();

            let filteredProducts = products.filter(product => {
                const searchMatch = product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);
                
                let categoryMatch;
                if (activeCategory === 'recomendados') {
                    const isDrink = product.category === 'bebidas';
                    const isBreakfastTime = product.category === 'desayunos' && (currentHour >= 5 && currentHour < 12);
                    const isDinnerTime = product.category === 'cenas' && (currentHour >= 18 || currentHour < 5);
                    categoryMatch = isDrink || isBreakfastTime || isDinnerTime;
                } else {
                    categoryMatch = activeCategory === 'all' || product.category === activeCategory;
                }

                const priceMatch = product.price >= minPrice && product.price <= maxPrice;
                return searchMatch && categoryMatch && priceMatch;
            });
            
            resultsCountEl.textContent = `${filteredProducts.length} resultados`;

            if (filteredProducts.length === 0) {
                 menuGrid.innerHTML = `<p class="no-results-message">No se encontraron productos.</p>`;
                 return;
            }

            filteredProducts.sort((a, b) => {
                switch (sortValue) {
                    case 'price-asc': return a.price - b.price;
                    case 'price-desc': return b.price - a.price;
                    case 'name-asc': return a.name.localeCompare(b.name);
                    default: return 0;
                }
            });

            menuGrid.innerHTML = filteredProducts.map(createProductCard).join('');
            
            menuGrid.querySelectorAll('.product-card').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
        }

        // --- Carga inicial para la página de menú ---
        setupCategoryButtons();
        updateMenuDisplay();

        // Listeners para filtros
        searchInput.addEventListener('input', updateMenuDisplay);
        sortOptions.addEventListener('change', updateMenuDisplay);
        minPriceInput.addEventListener('input', updateMenuDisplay);
        maxPriceInput.addEventListener('input', updateMenuDisplay);
    }
    
    // --- LÓGICA PARA ANIMACIONES (GLOBAL) ---
    // Esta la podemos dejar global, ya que no da error si no encuentra los elementos
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .tagline, .product-title, .price, .product-description');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));
}