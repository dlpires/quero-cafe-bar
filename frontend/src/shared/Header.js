export function createHeader(pageName) {
    const logoutBtn = pageName != 'Login' ? `<ion-buttons slot="end">
                            <ion-button id="logout-btn">
                            <ion-icon slot="icon-only" name="log-out"></ion-icon>
                            </ion-button>
                        </ion-buttons>`: ``;
    return `<ion-header>
                <ion-toolbar color="primary">
                    <ion-icon name="cafe" slot="start" style="margin-left: 15px; font-size: 24px;"></ion-icon>
                    <ion-title>Quero Café Bar - ${pageName}</ion-title>
                    ${logoutBtn}
                </ion-toolbar>
            </ion-header>`;
};