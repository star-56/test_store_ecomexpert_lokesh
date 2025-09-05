document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('productModal');
  const modalOverlay = modal.querySelector('.modal-overlay');
  const modalClose = modal.querySelector('.modal-close');
  
  // Mobile menu elements
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  
  // Soft Winter Jacket configuration
  const SOFT_WINTER_JACKET_HANDLE = 'soft-winter-jacket';
  const AUTO_ADD_CONDITIONS = {
    color: 'Black',
    size: 'Medium'
  };

  // Mobile menu functionality
  function openMobileMenu() {
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Mobile menu event listeners
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      openMobileMenu();
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', function(e) {
      e.preventDefault();
      closeMobileMenu();
    });
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', function(e) {
      if (e.target === mobileMenuOverlay) {
        closeMobileMenu();
      }
    });
  }

  // Random hotspot positioning
  function initializeHotspots() {
    const hotspots = document.querySelectorAll('.product-hotspot-overlay');
    const positionClasses = [
      'hotspot-pos-1', 'hotspot-pos-2', 'hotspot-pos-3', 'hotspot-pos-4', 
      'hotspot-pos-5', 'hotspot-pos-6', 'hotspot-pos-7', 'hotspot-pos-8',
      'hotspot-pos-9', 'hotspot-pos-10'
    ];
    
    hotspots.forEach((hotspot, index) => {
      // Remove any existing position classes
      hotspot.classList.remove(...positionClasses);
      
      // Add a random position class
      const randomPosition = positionClasses[Math.floor(Math.random() * positionClasses.length)];
      hotspot.classList.add(randomPosition);
      
      // Add event listener
      hotspot.addEventListener('click', function(e) {
        e.preventDefault();
        const productHandle = this.dataset.productHandle;
        if (productHandle) {
          openModal(productHandle);
        }
      });
    });
  }

  // Modal functionality - Updated to use product-card component
  function openModal(productHandle) {
    fetch(`/products/${productHandle}.js`)
      .then(response => response.json())
      .then(product => {
        console.log('Product data:', product);
        renderProductCard(product);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      })
      .catch(error => console.error('Error loading product:', error));
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Clear the product card container
    document.getElementById('productCardContainer').innerHTML = '';
  }

  // New function to render the product-card component dynamically
  function renderProductCard(product) {
    const container = document.getElementById('productCardContainer');
    
    // Get unique colors and sizes from variants
    const colors = getUniqueColors(product.variants);
    const sizes = getUniqueSizes(product.variants);
    
    console.log('Available colors:', colors);
    console.log('Available sizes:', sizes);
    
    // Build the product card HTML
    const productCardHTML = `
      <div class="product-card">
        <!-- Product Image -->
        <div class="product-image">
          ${product.featured_image ? 
            `<img src="${product.featured_image}" alt="${product.title}">` : 
            '<div class="placeholder-image"></div>'
          }
        </div>

        <!-- Product Details -->
        <div class="product-details">
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">${formatMoney(product.price)}</div>
          <p class="product-description">
            ${product.description || 'This one-piece swimsuit is crafted from jersey featuring an allover micro Monogram motif in relief.'}
          </p>
        </div>

        <!-- Color Selection -->
        <div class="color-section">
          <label class="section-label">Color</label>
          <div class="color-options">
            ${colors.map((color, index) => `
              <div class="color-option ${index === 0 ? 'selected' : ''}" data-color="${color}">
                <div class="color-indicator" style="background-color: ${getColorValue(color)};"></div>
                <span class="color-name">${color}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Size Selection -->
        <div class="size-section">
          <label class="section-label">Size</label>
          <div class="size-dropdown">
            <select class="size-select" id="product-size-${product.id}">
              <option value="">Choose your size</option>
              ${sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
            </select>
            <div class="dropdown-arrow">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Add to Cart Button -->
        <form class="add-to-cart-form" data-product-id="${product.id}">
          <button type="submit" class="add-to-cart-btn">
            <span>Add to cart</span>
            <svg width="20" height="2" viewBox="0 0 20 2" fill="none">
              <path d="M0 1H20" stroke="white" stroke-width="1.5"/>
            </svg>
          </button>
        </form>
      </div>
    `;
    
    container.innerHTML = productCardHTML;
    
    // Add event listeners to the newly created elements
    setupProductCardEvents(product);
  }

  function setupProductCardEvents(product) {
    // Color selection event listeners
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      option.addEventListener('click', function() {
        // Remove selected class from all options
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        // Add selected class to clicked option
        this.classList.add('selected');
      });
    });

    // Size dropdown styling
    const sizeSelect = document.querySelector('.size-select');
    if (sizeSelect) {
      sizeSelect.addEventListener('focus', function() {
        this.parentNode.querySelector('.dropdown-arrow svg').style.transform = 'rotate(180deg)';
      });
      
      sizeSelect.addEventListener('blur', function() {
        this.parentNode.querySelector('.dropdown-arrow svg').style.transform = 'rotate(0deg)';
      });
    }

    // Add to cart form submission
    const addToCartForm = document.querySelector('.add-to-cart-form');
    if (addToCartForm) {
      addToCartForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addToCart(product);
      });
    }
  }

  function getUniqueColors(variants) {
    if (!variants || !Array.isArray(variants)) {
      return ['Red', 'Grey']; // Default colors as fallback
    }
    
    const colors = new Set();
    variants.forEach(variant => {
      // Try different option positions for colors
      if (variant.option2 && variant.option2.trim() !== '') {
        colors.add(variant.option2.trim());
      } else if (variant.option1 && variant.option1.trim() !== '') {
        // Fallback to option1 if option2 is empty
        const option1 = variant.option1.trim().toLowerCase();
        if (!['xs', 's', 'm', 'l', 'xl', 'xxl', 'small', 'medium', 'large'].includes(option1)) {
          colors.add(variant.option1.trim());
        }
      }
    });
    
    const colorArray = Array.from(colors);
    return colorArray.length > 0 ? colorArray : ['Red', 'Grey']; // Default fallback
  }

  function getUniqueSizes(variants) {
    if (!variants || !Array.isArray(variants)) {
      return ['XS', 'S', 'M', 'L', 'XL']; // Default sizes as fallback
    }
    
    const sizes = new Set();
    variants.forEach(variant => {
      // Try different option positions for sizes
      if (variant.option1 && variant.option1.trim() !== '') {
        sizes.add(variant.option1.trim());
      } else if (variant.option2 && variant.option2.trim() !== '') {
        // Fallback to option2 if option1 is empty
        const option2 = variant.option2.trim().toLowerCase();
        if (['xs', 's', 'm', 'l', 'xl', 'xxl', 'small', 'medium', 'large'].includes(option2)) {
          sizes.add(variant.option2.trim());
        }
      }
    });
    
    const sizeArray = Array.from(sizes);
    return sizeArray.length > 0 ? sizeArray : ['XS', 'S', 'M', 'L', 'XL']; // Default fallback
  }

  function getColorValue(colorName) {
    if (!colorName) return '#CCCCCC';
    
    const colorMap = {
      'red': '#B20F36',
      'grey': '#AFAFB7',
      'gray': '#AFAFB7',
      'black': '#000000',
      'white': '#FFFFFF',
      'blue': '#0066CC',
      'green': '#00AA44',
      'yellow': '#FFDD00',
      'pink': '#FF69B4',
      'purple': '#8A2BE2',
      'orange': '#FF8800',
      'brown': '#8B4513',
      'beige': '#F5F5DC',
      'navy': '#000080',
      'maroon': '#800000',
      'teal': '#008080',
      'lime': '#00FF00',
      'olive': '#808000',
      'silver': '#C0C0C0',
      'gold': '#FFD700',
      'coral': '#FF7F50',
      'salmon': '#FA8072',
      'khaki': '#F0E68C',
      'tan': '#D2B48C',
      'crimson': '#DC143C',
      'indigo': '#4B0082',
      'violet': '#EE82EE',
      'turquoise': '#40E0D0',
      'mint': '#98FB98'
    };
    
    return colorMap[colorName.toLowerCase()] || '#CCCCCC';
  }

  function addToCart(product) {
    const selectedColorElement = document.querySelector('.color-option.selected');
    const selectedColor = selectedColorElement ? selectedColorElement.dataset.color : null;
    const selectedSize = document.querySelector('.size-select').value;

    console.log('Selected options:', { color: selectedColor, size: selectedSize });

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (!selectedColor) {
      alert('Please select a color');
      return;
    }

    // Find the matching variant
    const variant = product.variants.find(v => {
      return v.option1 === selectedSize && v.option2 === selectedColor;
    });

    console.log('Found variant:', variant);

    if (!variant) {
      alert('This combination is not available');
      return;
    }

    if (!variant.available) {
      alert('This variant is out of stock');
      return;
    }

    // Add main product to cart
    const formData = {
      items: [{
        id: variant.id,
        quantity: 1
      }]
    };

    // Check if we need to auto-add Soft Winter Jacket
    if (selectedColor === AUTO_ADD_CONDITIONS.color && 
        selectedSize === AUTO_ADD_CONDITIONS.size) {
      // Fetch Soft Winter Jacket and add it
      fetch(`/products/${SOFT_WINTER_JACKET_HANDLE}.js`)
        .then(response => response.json())
        .then(winterJacket => {
          if (winterJacket && winterJacket.variants.length > 0) {
            formData.items.push({
              id: winterJacket.variants[0].id,
              quantity: 1
            });
          }
          submitToCart(formData);
        })
        .catch(() => {
          // If winter jacket fetch fails, just add the main product
          submitToCart(formData);
        });
    } else {
      submitToCart(formData);
    }
  }

  function submitToCart(formData) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      closeModal();
      updateCartCount();
      showCartNotification('Product added to cart!');
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    });
  }

  function updateCartCount() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = cart.item_count;
        }
      });
  }

  function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  function formatMoney(cents) {
    return '€' + (cents / 100).toFixed(2);
  }

  // Event listeners
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }
  
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // ESC key to close modal and mobile menu
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (modal && modal.classList.contains('active')) {
        closeModal();
      }
      if (mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
        closeMobileMenu();
      }
    }
  });

  // Initialize hotspots with random positioning
  initializeHotspots();
});