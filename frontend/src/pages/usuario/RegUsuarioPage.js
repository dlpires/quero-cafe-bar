import './RegUsuarioPage.css'
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';
import { showToast, withLoading, validateRequired, focusFirstElement, hasFormChanges, getLoggedUserProfile } from '../../shared/util.js';

const pageName = 'Cadastrar Usuário';

class RegUsuarioPage extends HTMLElement {
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
        <form id="form-usuario">
          <ion-list>
            <ion-item>
              <ion-input type="text" name="nome" label="Nome Completo" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-input type="text" name="usuario" label="Usuário" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-input type="password" name="senha" label="Senha" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-select name="perfil" label="Perfil" label-placement="floating" value="1">
                <ion-select-option value="0">Administrador</ion-select-option>
                <ion-select-option value="1">Atendente</ion-select-option>
                <ion-select-option value="2">Cozinha</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <div class="ion-padding">
            <ion-button expand="block" type="submit" class="ion-margin-top" id="btn-submit">
              <ion-icon name="checkmark-circle" slot="start" class="radio-icon"></ion-icon>
              Salvar Usuário
            </ion-button>
            <ion-button expand="block" color="danger" id="btn-cancelar">
              <ion-icon name="close-circle" slot="start" class="radio-icon"></ion-icon>
              Cancelar
            </ion-button>
          </div>
        </form>
      </ion-content>
    `;

    this.querySelector('#form-usuario').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#btn-cancelar').addEventListener('click', () => this.confirmCancel());
    focusFirstElement(this);
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const nomeError = validateRequired(formData.get('nome'), 'Nome');
    const usuarioError = validateRequired(formData.get('usuario'), 'Usuário');
    const senhaError = validateRequired(formData.get('senha'), 'Senha');
    const perfilVal = formData.get('perfil');

    if (nomeError || usuarioError || senhaError || !perfilVal) {
      await showToast(nomeError || usuarioError || senhaError || 'O campo Perfil é obrigatório.', 'warning', 3000);
      focusFirstElement(form);
      return;
    }

    const usuarioData = {
      nome: formData.get('nome'),
      usuario: formData.get('usuario'),
      senha: formData.get('senha'),
      perfil: parseInt(perfilVal)
    };

    const submitBtn = this.querySelector('#btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Salvando...';

    try {
      await withLoading(api.addUsuario(usuarioData));
      await showToast('Registro salvo com sucesso!', 'success', 3000);
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao cadastrar usuario:', error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      await showToast(error.message, 'error', 5000);
    }
  }

  async confirmCancel() {
    const form = this.querySelector('#form-usuario');
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
    router.push('/usuarios', 'root');
  }
}

customElements.define('reg-usuario-page', RegUsuarioPage);
