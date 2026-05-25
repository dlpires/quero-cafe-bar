import './RegComandaPage.css';
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';
import { showToast, withLoading, focusFirstElement, hasFormChanges } from '../../shared/util.js';

const pageName = 'Abrir Comanda';

class RegComandaPage extends HTMLElement {
  async connectedCallback() {
    if (!requireAuth()) return;
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content class="ion-padding">
        <form id="form-comanda">
          <ion-list>
            <ion-item>
              <ion-select name="id_mesa" id="id_mesa" label="Selecionar Mesa" label-placement="floating" required>
                <div slot="label">Selecionar Mesa</div>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-input type="text" name="obs_comanda" id="obs_comanda" label="Observação" label-placement="floating"></ion-input>
            </ion-item>
          </ion-list>

          <div class="ion-padding">
            <ion-button expand="block" type="submit" class="ion-margin-top" id="btn-submit">
              <ion-icon name="checkmark-circle" class="radio-icon"></ion-icon>
              Abrir Comanda
            </ion-button>
            <ion-button expand="block" color="danger" id="btn-cancelar">
              <ion-icon name="close-circle" class="radio-icon"></ion-icon>
              Cancelar
            </ion-button>
          </div>
        </form>
      </ion-content>
    `;

    this.querySelector('#form-comanda').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#btn-cancelar').addEventListener('click', () => this.confirmCancel());

    await this.loadMesas();
    focusFirstElement(this);
  }

  async loadMesas() {
    try {
      const mesas = await api.getMesas();
      const select = this.querySelector('#id_mesa');
      mesas.forEach(mesa => {
        if (mesa.status) {
          const option = document.createElement('ion-select-option');
          option.value = mesa.id;
          option.textContent = `Mesa #${mesa.id} (${mesa.qtd_cadeiras} cadeiras)`;
          select.appendChild(option);
        }
      });
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
      await showToast('Erro ao carregar lista de mesas.', 'error', 3000);
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const id_mesa = formData.get('id_mesa');
    if (!id_mesa) {
      await showToast('O campo Mesa é obrigatório.', 'warning', 3000);
      focusFirstElement(form);
      return;
    }

    const comandaData = {
      id_mesa: parseInt(id_mesa),
      obs_comanda: formData.get('obs_comanda') || undefined,
    };

    const submitBtn = this.querySelector('#btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Salvando...';

    try {
      await withLoading(api.addComanda(comandaData));
      await showToast('Registro salvo com sucesso!', 'success', 3000);
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao abrir comanda:', error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      await showToast(error.message, 'error', 5000);
    }
  }

  async confirmCancel() {
    const form = this.querySelector('#form-comanda');
    if (hasFormChanges(form)) {
      const alert = document.createElement('ion-alert');
      alert.header = 'Descartar alterações?';
      alert.message = 'Há alterações não salvas. Deseja realmente cancelar?';
      alert.buttons = [
        { text: 'Continuar Editando', role: 'cancel' },
        { text: 'Descartar', handler: () => this.navigateBack() },
      ];
      document.body.appendChild(alert);
      await alert.present();
    } else {
      this.navigateBack();
    }
  }

  navigateBack() {
    const router = document.querySelector('ion-router');
    router.push('/comandas', 'root');
  }
}

customElements.define('reg-comanda-page', RegComandaPage);