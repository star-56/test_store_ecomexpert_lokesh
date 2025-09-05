document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('productModal');
  const modalOverlay = modal?.querySelector('.modal-overlay');
  const modalClose = modal?.querySelector('.modal-close');
  
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

  // Initialize all product cards on page load
  initializeProductCards();

  // Mobile menu functionality
  function openMobileMenu() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
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

  // Initialize all product cards
  function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card[data-product-handle]');
    
    productCards.forEach(card => {
      const productHandle = card.dataset.productHandle;
      if (productHandle && productHandle !== 'demo-product') {
        loadProductCard(card, productHandle);
      }
    });
  }

  // Load individual product card
  function loadProductCard(cardElement, productHandle) {
    fetch(`/products/${productHandle}.js`)
      .then(response => response.json())
      .then(product => {
        console.log('Loading product card for:', product.title);
        populateProductCard(cardElement, product);
      })
      .catch(error => {
        console.error('Error loading product:', error);
        showProductCardError(cardElement);
      });
  }

  // Populate product card with data
  function populateProductCard(cardElement, product) {
    // Set basic product info
    const titleElement = cardElement.querySelector('#productTitle');
    const priceElement = cardElement.querySelector('#productPrice');
    const descriptionElement = cardElement.querySelector('#productDescription');
    const imageElement = cardElement.querySelector('#productImage');
    const placeholderElement = cardElement.querySelector('#placeholderImage');

    if (titleElement) titleElement.textContent = product.title;
    if (priceElement) priceElement.textContent = formatMoney(product.price);
    if (descriptionElement) {
      const description = product.description || 'This one-piece swimsuit is crafted from jersey featuring an allover micro Monogram motif in relief.';
      descriptionElement.textContent = description.length > 120 ? description.substring(0, 120) + '...' : description;
    }

    // Set product image
    if (product.featured_image && imageElement && placeholderElement) {
      imageElement.src = product.featured_image;
      imageElement.alt = product.title;
      imageElement.style.display = 'block';
      placeholderElement.style.display = 'none';
    }

    // Determine option keys (Size = option1, Color = option2 based on your specification)
    const sizeOptionKey = 'option1';
    const colorOptionKey = 'option2';

    console.log(`Product: ${product.title} - Using Size: ${sizeOptionKey}, Color: ${colorOptionKey}`);

    // Populate colors
    populateCardColors(cardElement, product, colorOptionKey);
    
    // Populate sizes
    populateCardSizes(cardElement, product, sizeOptionKey);

    // Store product data and option keys for cart functionality
    cardElement.productData = {
      product,
      sizeOptionKey,
      colorOptionKey
    };

    // Set up add to cart functionality
    setupCardAddToCart(cardElement);

    // Enable the add to cart button
    const addToCartBtn = cardElement.querySelector('#addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.disabled = false;
      addToCartBtn.querySelector('span').textContent = 'Add to cart';
    }
  }

  // Populate color options for product card
  function populateCardColors(cardElement, product, colorOptionKey) {
    const colorOptions = cardElement.querySelector('#colorOptions');
    if (!colorOptions) return;

    colorOptions.innerHTML = ''; // Clear existing options
    
    // Get unique colors
    const colors = getUniqueOptionValues(product.variants, colorOptionKey);
    console.log('🎨 Card Colors:', colors);
    
    if (colors.length > 0) {
      colors.forEach((color, index) => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color-option';
        colorDiv.dataset.color = color;
        if (index === 0) colorDiv.classList.add('selected');
        
        // Create color indicator
        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'color-indicator';
        const colorValue = getColorValue(color);
        colorIndicator.style.backgroundColor = colorValue;
        
        // Add specific color class for styling
        if (color.toLowerCase() === 'red') colorIndicator.classList.add('red-color');
        if (color.toLowerCase() === 'grey' || color.toLowerCase() === 'gray') colorIndicator.classList.add('grey-color');
        
        // Create color name
        const colorName = document.createElement('span');
        colorName.className = 'color-name';
        colorName.textContent = color;
        
        colorDiv.appendChild(colorIndicator);
        colorDiv.appendChild(colorName);
        
        // Add click handler
        colorDiv.addEventListener('click', () => selectCardColor(cardElement, colorDiv));
        
        colorOptions.appendChild(colorDiv);
      });
    } else {
      // Fallback if no colors found
      const defaultColor = document.createElement('div');
      defaultColor.className = 'color-option selected';
      defaultColor.dataset.color = 'Default';
      defaultColor.innerHTML = `
        <div class="color-indicator" style="background-color: #CCCCCC;"></div>
        <span class="color-name">Default</span>
      `;
      colorOptions.appendChild(defaultColor);
    }
  }

  // Populate size options for product card
  function populateCardSizes(cardElement, product, sizeOptionKey) {
    const sizeSelect = cardElement.querySelector('#sizeSelect');
    if (!sizeSelect) return;

    sizeSelect.innerHTML = '<option value="">Choose your size</option>';
    
    // Get unique sizes
    const sizes = getUniqueOptionValues(product.variants, sizeOptionKey);
    console.log('📏 Card Sizes:', sizes);
    
    sizes.forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    });

    // Add change handler to update variant
    sizeSelect.addEventListener('change', () => updateCardVariant(cardElement));
  }

  // Select color in product card
  function selectCardColor(cardElement, selectedColorDiv) {
    // Remove selected class from all color options in this card
    cardElement.querySelectorAll('.color-option').forEach(div => {
      div.classList.remove('selected');
    });
    
    // Add selected class to clicked color
    selectedColorDiv.classList.add('selected');
    
    // Update variant
    updateCardVariant(cardElement);
  }

  // Update variant based on current selections
  function updateCardVariant(cardElement) {
    const { product, sizeOptionKey, colorOptionKey } = cardElement.productData || {};
    if (!product) return;

    const selectedColor = cardElement.querySelector('.color-option.selected')?.dataset.color;
    const selectedSize = cardElement.querySelector('#sizeSelect').value;
    const variantIdInput = cardElement.querySelector('#variantId');

    if (selectedColor && selectedSize && variantIdInput) {
      // Find matching variant
      const variant = product.variants.find(v => {
        return v[sizeOptionKey] === selectedSize && v[colorOptionKey] === selectedColor;
      });

      if (variant && variant.available) {
        variantIdInput.value = variant.id;
        console.log('Updated card variant:', variant.id, 'for', selectedSize, selectedColor);
      } else {
        variantIdInput.value = '';
        console.log('No available variant for', selectedSize, selectedColor);
      }
    }
  }

  // Setup add to cart functionality for product card
  function setupCardAddToCart(cardElement) {
    const form = cardElement.querySelector('#addToCartForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      addCardToCart(cardElement);
    });
  }

  // Add product card to cart
  function addCardToCart(cardElement) {
    const { product } = cardElement.productData || {};
    if (!product) return;

    const selectedColor = cardElement.querySelector('.color-option.selected')?.dataset.color;
    const selectedSize = cardElement.querySelector('#sizeSelect').value;
    const variantId = cardElement.querySelector('#variantId').value;

    console.log('Card Add to Cart:', { color: selectedColor, size: selectedSize, variantId });

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (!selectedColor) {
      alert('Please select a color');
      return;
    }

    if (!variantId) {
      alert('This combination is not available');
      return;
    }

    // Add main product to cart
    const formData = {
      items: [{
        id: parseInt(variantId),
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

  // Show error state for product card
  function showProductCardError(cardElement) {
    const titleElement = cardElement.querySelector('#productTitle');
    const addToCartBtn = cardElement.querySelector('#addToCartBtn');
    
    if (titleElement) titleElement.textContent = 'Product unavailable';
    if (addToCartBtn) {
      addToCartBtn.disabled = true;
      addToCartBtn.querySelector('span').textContent = 'Unavailable';
    }
  }

  // Random hotspot positioning (keeping existing functionality)
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

  // Modal functionality (keeping existing modal code)
  function openModal(productHandle) {
    if (!modal) return;
    
    fetch(`/products/${productHandle}.js`)
      .then(response => response.json())
      .then(product => {
        console.log('Product data:', product);
        populateModal(product);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      })
      .catch(error => console.error('Error loading product:', error));
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function populateModal(product) {
    // Set basic product info
    const modalTitle = document.getElementById('modalProductTitle');
    const modalPrice = document.getElementById('modalProductPrice');
    const modalDescription = document.getElementById('modalProductDescription');
    const modalImage = document.getElementById('modalProductImage');

    if (modalTitle) modalTitle.textContent = product.title;
    if (modalPrice) modalPrice.textContent = formatMoney(product.price);
    if (modalDescription) modalDescription.textContent = product.description || 
      'This one-piece swimsuit is crafted from jersey featuring an allover micro Monogram motif in relief.';
    
    // Set product image
    if (product.featured_image && modalImage) {
      modalImage.src = product.featured_image;
      modalImage.alt = product.title;
    }

    // Determine option keys
    let colorOptionKey = 'option2';  // Color is option2 based on your specification
    let sizeOptionKey = 'option1';   // Size is option1 based on your specification

    console.log(`Modal: Colors from ${colorOptionKey}, Sizes from ${sizeOptionKey}`);

    // Build color options dynamically
    const colorOptions = document.getElementById('colorOptions');
    if (colorOptions) {
      colorOptions.innerHTML = ''; // Clear existing options
      
      const colors = getUniqueOptionValues(product.variants, colorOptionKey);
      console.log('🎨 Modal Colors:', colors);
      
      if (colors.length > 0) {
        colors.forEach((color, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'color-option';
          button.dataset.color = color;
          if (index === 0) button.classList.add('selected');
          
          const colorBar = document.createElement('div');
          colorBar.className = 'color-bar';
          const colorValue = getColorValue(color);
          colorBar.style.backgroundColor = colorValue;
          
          const colorText = document.createElement('span');
          colorText.textContent = color;
          
          button.appendChild(colorBar);
          button.appendChild(colorText);
          button.addEventListener('click', () => selectColor(button, product));
          colorOptions.appendChild(button);
        });
      }
    }

    // Build size options dynamically
    const sizeSelect = document.getElementById('sizeOptions');
    if (sizeSelect) {
      sizeSelect.innerHTML = '<option value="">Choose your size</option>';
      
      const sizes = getUniqueOptionValues(product.variants, sizeOptionKey);
      console.log('📏 Modal Sizes:', sizes);
      
      sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
      });
    }

    // Store the option keys for later use in addToCart
    window.currentProductConfig = {
      colorOptionKey,
      sizeOptionKey,
      product
    };

    // Set up form submission
    const form = document.getElementById('modalProductForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        addToCart(product);
      };
    }
  }

  function selectColor(button, product) {
    // Remove selected class from all color options
    document.querySelectorAll('#colorOptions .color-option').forEach(btn => {
      btn.classList.remove('selected');
    });
    // Add selected class to clicked button
    button.classList.add('selected');
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
    
    // Try exact match first, then lowercase match
    return colorMap[colorName] || colorMap[colorName.toLowerCase()] || '#CCCCCC';
  }

  function getUniqueOptionValues(variants, optionKey) {
    if (!variants || !Array.isArray(variants)) {
      console.warn('No variants found or variants is not an array');
      return [];
    }
    
    const values = new Set();
    variants.forEach(variant => {
      if (variant && variant[optionKey] && variant[optionKey].trim() !== '') {
        values.add(variant[optionKey].trim());
      }
    });
    
    const uniqueValues = Array.from(values);
    console.log(`Unique ${optionKey} values:`, uniqueValues);
    return uniqueValues;
  }

  function addToCart(product) {
    const selectedColor = document.querySelector('#colorOptions .color-option.selected')?.dataset.color;
    const selectedSize = document.getElementById('sizeOptions').value;

    console.log('Modal - Selected options:', { color: selectedColor, size: selectedSize });

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (!selectedColor) {
      alert('Please select a color');
      return;
    }

    // Find the matching variant using the correct option mapping
    const variant = product.variants.find(v => {
      const match = v.option1 === selectedSize && v.option2 === selectedColor;
      console.log(`Checking variant: ${v.option1} === ${selectedSize} && ${v.option2} === ${selectedColor} = ${match}`);
      return match;
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
      if (modal && modal.classList.contains('active')) {
        closeModal();
      }
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

  // Event listeners for modal (if modal exists)
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);

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

  // Initialize hotspots with random positioning (if they exist)
  if (document.querySelectorAll('.product-hotspot-overlay').length > 0) {
    initializeHotspots();
  }
});