import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';
import { showToast, withLoading, validateRequired, validatePositiveNumber, focusFirstElement, hasFormChanges, getLoggedUserProfile } from '../../shared/util.js';

const pageName = 'Cadastrar Produto';

class RegProdutoPage extends HTMLElement {
  async connectedCallback() {
    if (!requireAuth()) return;
    const perfil = await getLoggedUserProfile();
    if (perfil !== 0) {
      await showToast('Você não tem permissão para acessar esta página.', 'error', 3000);
      document.querySelector('ion-router')?.push('/home', 'root');
      return;
    }
    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content class="ion-padding">
        <form id="form-produto">
          <ion-list>
            <ion-item>
              <ion-input type="text" name="dsc_produto" label="Descrição do Produto" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-input type="number" step="0.01" name="valor_unit" label="Valor Unitário (R$)" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label>Ativo</ion-label>
              <ion-toggle slot="end" name="status" checked></ion-toggle>
            </ion-item>
          </ion-list>

          <div class="ion-padding">
            <ion-button expand="block" type="submit" class="ion-margin-top" id="btn-submit">
              <ion-icon name="checkmark-circle" class="radio-icon"></ion-icon>
              Salvar Produto
            </ion-button>
            <ion-button expand="block" color="danger" id="btn-cancelar">
              <ion-icon name="close-circle" class="radio-icon"></ion-icon>
              Cancelar
            </ion-button>
          </div>
        </form>
      </ion-content>
    `;

    this.querySelector('#form-produto').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#btn-cancelar').addEventListener('click', () => this.confirmCancel());
    focusFirstElement(this);
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const dscError = validateRequired(formData.get('dsc_produto'), 'Descrição do Produto');
    const valorError = validatePositiveNumber(formData.get('valor_unit'), 'Valor Unitário');

    if (dscError || valorError) {
      await showToast(dscError || valorError, 'warning', 3000);
      focusFirstElement(form);
      return;
    }

    const produtoData = {
      dsc_produto: formData.get('dsc_produto'),
      valor_unit: parseFloat(formData.get('valor_unit')),
      status: (formData.get('status') ?? 'on') === 'on',
    };

    const submitBtn = this.querySelector('#btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Salvando...';

    try {
      await withLoading(api.addProduto(produtoData));
      await showToast('Registro salvo com sucesso!', 'success', 3000);
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      await showToast(error.message, 'error', 5000);
    }
  }

  async confirmCancel() {
    const form = this.querySelector('#form-produto');
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
    router.push('/produtos', 'root');
  }
}

customElements.define('reg-produto-page', RegProdutoPage);