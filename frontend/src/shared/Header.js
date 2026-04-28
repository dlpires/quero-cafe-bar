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

    // 3. Cria o elemento <ion-menu>
    const menu = document.createElement('ion-menu');
    menu.contentId = mainContent.id; // Garante que o ID do conteúdo seja o mesmo que o menu espera.
    menu.innerHTML = `
        <ion-header>
            <ion-toolbar color="secondary">
                <ion-title>Menu</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item button class="menu-item" data-url="/home">
                    <ion-icon name="home-outline" slot="start"></ion-icon>
                    <ion-label>Home</ion-label>
                </ion-item>
                <ion-item button class="menu-item" data-url="/produtos">
                    <ion-icon name="fast-food-outline" slot="start"></ion-icon>
                    <ion-label>Produtos</ion-label>
                </ion-item>
                <ion-item button class="menu-item" data-url="/usuarios">
                    <ion-icon name="people-outline" slot="start"></ion-icon>
                    <ion-label>Usuários</ion-label>
                </ion-item>
                <ion-item button class="menu-item" data-url="/mesas">
                    <ion-icon name="grid-outline" slot="start"></ion-icon>
                    <ion-label>Mesas</ion-label>
                </ion-item>
                <ion-item button class="menu-item" data-url="/comandas">
                    <ion-icon name="receipt-outline" slot="start"></ion-icon>
                    <ion-label>Comandas</ion-label>
                </ion-item>

            </ion-list>
        </ion-content>
    `;

    // 4. Adiciona os eventos de clique para a navegação
    menu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', async () => {
            const url = item.dataset.url;
            const router = document.querySelector('ion-router');
            if (router && window.location.hash.substring(1) !== url) {
                router.push(url, 'root');
            }
            await menu.close(); // Fecha o menu após a navegação
        });
    });

    // 5. Adiciona o menu ao DOM, no início do <body>
    document.body.prepend(menu);
};

export function createHeader(pageName) {
    if (pageName !== 'Login') {
        createAndInjectMenu();
    }

    const startSlotContent = pageName !== 'Login' ? `<ion-buttons slot="start"><ion-menu-button></ion-menu-button></ion-buttons>` : `<ion-icon name="cafe" slot="start" style="margin-left: 15px; font-size: 24px;"></ion-icon>`;
    const logoutBtn = pageName !== 'Login' ? `<ion-buttons slot="end"><ion-button id="logout-btn"><ion-icon slot="icon-only" name="log-out-outline"></ion-icon></ion-button></ion-buttons>` : ``;

    return `<ion-header>
                <ion-toolbar color="primary">
                    ${startSlotContent}
                    <ion-title>Quero Café Bar - ${pageName}</ion-title>
                    ${logoutBtn}
                </ion-toolbar>
            </ion-header>`;
};