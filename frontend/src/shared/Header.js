/**
 * Cria e injeta o menu lateral na aplicação.
 * A função garante que o menu seja criado apenas uma vez.
 */
const createAndInjectMenu = () => {
    // 1. Evita a criação de múltiplos menus
    if (document.querySelector('ion-menu')) {
        return;
    }

    // 2. O <ion-menu> precisa de um `contentId` que aponte para a área de conteúdo principal.
    //    Vamos encontrar o elemento de saída do roteador (ion-nav) e garantir que ele tenha um ID.
    const mainContent = document.querySelector('ion-nav'); // O outlet do ion-router em projetos vanilla.
    const contentId = 'main-content';

    if (!mainContent) {
        console.error('[Header.js] Elemento <ion-nav> não encontrado. O menu lateral não pode ser inicializado.');
        return; // Aborta a criação do menu se o conteúdo principal não for encontrado.
    }

    if (!mainContent.id) {
        mainContent.id = contentId;
    }

    const menuItems = [
        { url: '/home', icon: 'home-outline', label: 'Home', profiles: [0, 1] },
        { url: '/produtos', icon: 'fast-food-outline', label: 'Produtos', profiles: [0] },
        { url: '/usuarios', icon: 'people-outline', label: 'Usuários', profiles: [0] },
        { url: '/mesas', icon: 'grid-outline', label: 'Mesas', profiles: [0] },
        { url: '/comandas', icon: 'receipt-outline', label: 'Comandas', profiles: [0, 1] },
        { url: '/cozinha', icon: 'restaurant-outline', label: 'Cozinha', profiles: [0, 1, 2] },
    ];

    const userPerfil = (() => {
        const stored = localStorage.getItem('user_perfil');
        return stored !== null ? parseInt(stored, 10) : null;
    })();

    const allowedItems = userPerfil !== null
        ? menuItems.filter(item => item.profiles.includes(userPerfil))
        : menuItems;

    // 3. Cria o elemento <ion-menu>
    const menu = document.createElement('ion-menu');
    menu.contentId = mainContent.id;

    const header = document.createElement('ion-header');
    const toolbar = document.createElement('ion-toolbar');
    toolbar.setAttribute('color', 'secondary');
    const title = document.createElement('ion-title');
    title.textContent = 'Menu';
    toolbar.appendChild(title);
    header.appendChild(toolbar);

    const content = document.createElement('ion-content');
    const list = document.createElement('ion-list');

    allowedItems.forEach(item => {
        const listItem = document.createElement('ion-item');
        listItem.setAttribute('button', '');
        listItem.classList.add('menu-item');
        listItem.dataset.url = item.url;

        const icon = document.createElement('ion-icon');
        icon.setAttribute('name', item.icon);
        icon.setAttribute('slot', 'start');
        icon.setAttribute('aria-hidden', 'true');

        const label = document.createElement('ion-label');
        label.textContent = item.label;

        listItem.appendChild(icon);
        listItem.appendChild(label);
        listItem.addEventListener('click', async () => {
            const router = document.querySelector('ion-router');
            if (router && window.location.hash.substring(1) !== item.url) {
                router.push(item.url, 'root');
            }
            await menu.close();
        });
        list.appendChild(listItem);
    });

    content.appendChild(list);
    menu.appendChild(header);
    menu.appendChild(content);

    // 4. Adiciona o menu ao DOM, no início do <body>
    document.body.prepend(menu);
};

export function createHeader(pageName) {
    if (pageName !== 'Login') {
        createAndInjectMenu();
    }

    const startSlotContent = pageName !== 'Login' ? `<ion-buttons slot="start"><ion-menu-button></ion-menu-button></ion-buttons>` : `<ion-icon name="cafe" slot="start" style="margin-left: 15px; font-size: 24px;"></ion-icon>`;
    const logoutBtn = pageName !== 'Login' ? `<ion-buttons slot="end"><ion-button id="logout-btn" aria-label="Sair"><ion-icon slot="icon-only" name="log-out-outline"></ion-icon></ion-button></ion-buttons>` : ``;

    return `<ion-header>
                <ion-toolbar color="primary">
                    ${startSlotContent}
                    <ion-title>Quero Café Bar - ${pageName}</ion-title>
                    ${logoutBtn}
                </ion-toolbar>
            </ion-header>`;
};