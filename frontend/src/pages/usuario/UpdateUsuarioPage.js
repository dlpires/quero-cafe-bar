import './UpdateUsuarioPage.css'
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';
import { requireAuth } from '../../services/auth.js';
import { showToast, withLoading, validateRequired, focusFirstElement, hasFormChanges, getLoggedUserProfile } from '../../shared/util.js';

const pageName = 'Editar Usuário';

class UpdateUsuarioPage extends HTMLElement {
  async connectedCallback() {
    if (!requireAuth()) return;
    const perfil = await getLoggedUserProfile();
    if (perfil !== 0) {
      await showToast('Você não tem permissão para acessar esta página.', 'error', 3000);
      document.querySelector('ion-router')?.push('/home', 'root');
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    this.usuarioId = urlParams.get('id');

    this.classList.add('ion-page');
    this.innerHTML = `
      ${createHeader(pageName)}
      <ion-content class="ion-padding">
        <form id="form-usuario">
          <ion-list>
            <ion-item>
              <ion-input type="text" name="nome" id="nome" label="Nome Completo" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-input type="text" name="usuario" id="usuario" label="Usuário" label-placement="floating" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-input type="password" name="senha" id="senha" label="Nova Senha (deixe em branco para manter)" label-placement="floating"></ion-input>
            </ion-item>

            <ion-item>
              <ion-select name="perfil" id="perfil" label="Perfil" label-placement="floating">
                <ion-select-option value="0">Administrador</ion-select-option>
                <ion-select-option value="1">Atendente</ion-select-option>
                <ion-select-option value="2">Cozinha</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <div class="ion-padding">
            <ion-button expand="block" type="submit" class="ion-margin-top" id="btn-submit">
              <ion-icon name="checkmark-circle" slot="start" class="radio-icon"></ion-icon>
              Salvar Alterações
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

    if (this.usuarioId) {
      await this.loadUsuarioData();
    }

    focusFirstElement(this);
  }

  async loadUsuarioData() {
    try {
      const usuario = await api.getUsuarioById(this.usuarioId);
      this.querySelector('#nome').value = usuario.nome;
      this.querySelector('#usuario').value = usuario.usuario;
      this.querySelector('#perfil').value = usuario.perfil.toString();
    } catch (error) {
      console.error('Erro ao carregar usuario:', error);
      await showToast('Não foi possível carregar os dados do usuário.', 'error', 5000);
      this.navigateBack();
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const nomeError = validateRequired(formData.get('nome'), 'Nome');
    const usuarioError = validateRequired(formData.get('usuario'), 'Usuário');
    const perfilVal = formData.get('perfil');

    if (nomeError || usuarioError || !perfilVal) {
      await showToast(nomeError || usuarioError || 'O campo Perfil é obrigatório.', 'warning', 3000);
      focusFirstElement(form);
      return;
    }

    const usuarioData = {
      nome: formData.get('nome'),
      usuario: formData.get('usuario'),
      perfil: parseInt(perfilVal)
    };

    const senha = formData.get('senha');
    if (senha) {
      usuarioData.senha = senha;
    }

    const submitBtn = this.querySelector('#btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Salvando...';

    try {
      await withLoading(api.updateUsuario(this.usuarioId, usuarioData));
      await showToast('Registro atualizado com sucesso!', 'success', 3000);
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao salvar usuario:', error);
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

customElements.define('update-usuario-page', UpdateUsuarioPage);
