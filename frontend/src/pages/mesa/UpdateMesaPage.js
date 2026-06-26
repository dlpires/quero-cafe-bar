import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';
import { showToast, withLoading, validatePositiveNumber, focusFirstElement, hasFormChanges, getLoggedUserProfile } from '../../shared/util.js';

const pageName = 'Editar Mesa';

class UpdateMesaPage extends HTMLElement {
  async connectedCallback() {
    if (!requireAuth()) return;
    const perfil = await getLoggedUserProfile();
    if (perfil !== 0) {
      await showToast('Você não tem permissão para acessar esta página.', 'error', 3000);
      document.querySelector('ion-router')?.push('/home', 'root');
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    this.mesaId = urlParams.get('id');
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content class="ion-padding">
        <form id="form-mesa">
          <ion-list>
            <ion-item>
              <ion-input type="number" name="qtd_cadeiras" id="qtd_cadeiras" label="Quantidade de Cadeiras" label-placement="floating" required></ion-input>
            </ion-item>
            <ion-item>
              <ion-label>Ativa</ion-label>
              <ion-toggle slot="end" name="status" id="status"></ion-toggle>
            </ion-item>
          </ion-list>
          <div class="ion-padding">
            <ion-button expand="block" type="submit" class="ion-margin-top" id="btn-submit">Salvar Alterações</ion-button>
            <ion-button expand="block" color="danger" id="btn-cancelar">Cancelar</ion-button>
          </div>
        </form>
      </ion-content>
    `;
    this.querySelector('#form-mesa').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#btn-cancelar').addEventListener('click', () => this.confirmCancel());
    if (this.mesaId) await this.loadMesaData();
    focusFirstElement(this);
  }

  async loadMesaData() {
    try {
      const mesa = await api.getMesaById(this.mesaId);
      this.querySelector('#qtd_cadeiras').value = mesa.qtd_cadeiras;
      this.querySelector('#status').checked = mesa.status;
    } catch (error) {
      await showToast('Não foi possível carregar os dados da mesa.', 'error', 5000);
      this.navigateBack();
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const qtdError = validatePositiveNumber(formData.get('qtd_cadeiras'), 'Quantidade de Cadeiras');

    if (qtdError) {
      await showToast(qtdError, 'warning', 3000);
      focusFirstElement(form);
      return;
    }

    const mesaData = {
      qtd_cadeiras: parseInt(formData.get('qtd_cadeiras')),
      status: (formData.get('status') ?? 'on') === 'on'
    };

    const submitBtn = this.querySelector('#btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Salvando...';

    try {
      await withLoading(api.updateMesa(this.mesaId, mesaData));
      await showToast('Registro atualizado com sucesso!', 'success', 3000);
      this.navigateBack();
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      await showToast(error.message, 'error', 5000);
    }
  }

  async confirmCancel() {
    const form = this.querySelector('#form-mesa');
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
    router.push('/mesas', 'root');
  }
}

customElements.define('update-mesa-page', UpdateMesaPage);
