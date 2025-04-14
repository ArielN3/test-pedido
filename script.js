// Estado do carrinho
let carrinho = [];
const TAXA_ENTREGA = 5.00;

// Elementos do DOM
const mainContent = document.querySelector('.main-content');
const cartButton = document.getElementById('cartButton');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const closeModal = document.getElementById('closeModal');
const closeCheckout = document.getElementById('closeCheckout');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartFooter = document.getElementById('cartFooter');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const floatingCart = document.getElementById('floatingCart');
const floatingCartItems = document.getElementById('floatingCartItems');
const floatingCartTotal = document.getElementById('floatingCartTotal');
const viewOrder = document.getElementById('viewOrder');
const finishOrder = document.getElementById('finishOrder');
const checkoutForm = document.getElementById('checkoutForm');
const trocoGroup = document.getElementById('trocoGroup');
const checkoutSubtotal = document.getElementById('checkoutSubtotal');
const checkoutDelivery = document.getElementById('checkoutDelivery');
const checkoutTotal = document.getElementById('checkoutTotal');

// Renderiza o cardápio
function renderizarCardapio() {
    Object.entries(produtos).forEach(([categoria, items]) => {
        const section = document.createElement('section');
        section.className = 'section';
        
        section.innerHTML = `
            <h2 class="section-title">${categoria}</h2>
            <div class="cards-grid">
                ${items.map(item => `
                    <div class="card">
                        <img src="${item.imagem}" alt="${item.nome}" class="card-image">
                        <div class="card-content">
                            <h3 class="card-title">${item.nome}</h3>
                            <p class="card-description">${item.descricao}</p>
                            <p class="card-price">R$ ${item.preco.toFixed(2)}</p>
                            <div class="quantity-controls">
                                <button class="quantity-button decrease-button" onclick="removerDoCarrinho('${item.id}')">-</button>
                                <span class="quantity" data-item-id="${item.id}">0</span>
                                <button class="quantity-button increase-button" onclick="adicionarAoCarrinho('${item.id}', '${item.nome}', ${item.preco})">+</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        mainContent.appendChild(section);
    });
}

// Funções do carrinho
function adicionarAoCarrinho(id, nome, preco) {
    const itemExistente = carrinho.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ id, nome, quantidade: 1, precoUnitario: preco });
    }
    
    atualizarInterface();
}

function removerDoCarrinho(id) {
    const itemIndex = carrinho.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        if (carrinho[itemIndex].quantidade > 1) {
            carrinho[itemIndex].quantidade -= 1;
        } else {
            carrinho.splice(itemIndex, 1);
        }
    }
    
    atualizarInterface();
}

function atualizarInterface() {
    // Atualiza as quantidades nos cards
    carrinho.forEach(item => {
        const quantityElement = document.querySelector(`.quantity[data-item-id="${item.id}"]`);
        if (quantityElement) {
            quantityElement.textContent = item.quantidade;
        }
    });
    
    // Atualiza o contador do carrinho
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    cartCount.textContent = totalItens;
    cartCount.classList.toggle('hidden', totalItens === 0);
    
    // Atualiza o carrinho flutuante
    const totalPreco = carrinho.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0);
    floatingCart.classList.toggle('hidden', totalItens === 0);
    floatingCartItems.textContent = `${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`;
    floatingCartTotal.textContent = `Total: R$ ${totalPreco.toFixed(2)}`;
    
    // Atualiza o modal do carrinho
    atualizarModalCarrinho();
}

function atualizarModalCarrinho() {
    if (carrinho.length === 0) {
        cartEmpty.classList.remove('hidden');
        cartItems.classList.add('hidden');
        cartFooter.classList.add('hidden');
        return;
    }
    
    cartEmpty.classList.add('hidden');
    cartItems.classList.remove('hidden');
    cartFooter.classList.remove('hidden');
    
    const totalPreco = carrinho.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0);
    
    cartItems.innerHTML = carrinho.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h3>${item.nome}</h3>
                <p class="cart-item-price">${item.quantidade}x R$ ${item.precoUnitario.toFixed(2)}</p>
            </div>
            <p class="cart-item-total">R$ ${(item.quantidade * item.precoUnitario).toFixed(2)}</p>
        </div>
    `).join('');
    
    cartTotalPrice.textContent = `R$ ${totalPreco.toFixed(2)}`;
    
    // Atualiza os valores no checkout
    const subtotal = totalPreco;
    checkoutSubtotal.textContent = `R$ ${subtotal.toFixed(2)}`;
    checkoutDelivery.textContent = `R$ ${TAXA_ENTREGA.toFixed(2)}`;
    checkoutTotal.textContent = `R$ ${(subtotal + TAXA_ENTREGA).toFixed(2)}`;
}

// Event Listeners
cartButton.addEventListener('click', () => {
    cartModal.classList.remove('hidden');
    atualizarModalCarrinho();
});

closeModal.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

closeCheckout.addEventListener('click', () => {
    checkoutModal.classList.add('hidden');
});

viewOrder.addEventListener('click', () => {
    cartModal.classList.remove('hidden');
    atualizarModalCarrinho();
});

finishOrder.addEventListener('click', () => {
    cartModal.classList.add('hidden');
    checkoutModal.classList.remove('hidden');
});

// Manipulação do formulário de checkout
document.querySelectorAll('input[name="pagamento"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        trocoGroup.classList.toggle('hidden', e.target.value !== 'dinheiro');
        if (e.target.value !== 'dinheiro') {
            document.getElementById('troco').value = '';
        }
    });
});

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(checkoutForm);
    const pedido = {
        items: carrinho,
        cliente: {
            nome: formData.get('nome'),
            telefone: formData.get('telefone'),
            endereco: {
                cep: formData.get('cep'),
                logradouro: formData.get('endereco'),
                numero: formData.get('numero'),
                complemento: formData.get('complemento'),
                bairro: formData.get('bairro')
            }
        },
        pagamento: {
            metodo: formData.get('pagamento'),
            troco: formData.get('troco') || null
        },
        valores: {
            subtotal: carrinho.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0),
            taxaEntrega: TAXA_ENTREGA,
            total: carrinho.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0) + TAXA_ENTREGA
        }
    };
    
    // Aqui você pode enviar o pedido para seu backend
    console.log('Pedido finalizado:', pedido);
    
    alert('Pedido realizado com sucesso!');
    carrinho = [];
    atualizarInterface();
    checkoutModal.classList.add('hidden');
    checkoutForm.reset();
});

// Inicialização
renderizarCardapio();