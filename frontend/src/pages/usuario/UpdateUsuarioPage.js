import './UpdateUsuarioPage.css'
import { createHeader } from '../../shared/Header.js';
import { api } from '../../services/api.js';

const pageName = 'Editar Usuário';

class UpdateUsuarioPage extends HTMLElement {
  async connectedCallback() {
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
              </ion-select>
            </ion-item>
          </ion-list>

          <div class="ion-padding">
            <ion-button expand="block" type="submit" class="ion-margin-top">
              <ion-icon name="checkmark-circle" slot="start" style="margin-right: 8px;"></ion-icon>
              Salvar Alterações
            </ion-button>
            <ion-button expand="block" color="danger" id="btn-cancelar">
              <ion-icon name="close-circle" slot="start" style="margin-right: 8px;"></ion-icon>
              Cancelar
            </ion-button>
          </div>
        </form>
      </ion-content>
    `;

    this.querySelector('#form-usuario').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#btn-cancelar').addEventListener('click', () => this.navigateBack());

    if (this.usuarioId) {
      await this.loadUsuarioData();
    }
  }

  async loadUsuarioData() {
    try {
      const usuario = await api.getUsuarioById(this.usuarioId);
      this.querySelector('#nome').value = usuario.nome;
      this.querySelector('#usuario').value = usuario.usuario;
      this.querySelector('#perfil').value = usuario.perfil.toString();
    } catch (error) {
      console.error('Erro ao carregar usuario:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível carregar os dados do usuário.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
      this.navigateBack();
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const usuarioData = {
      nome: formData.get('nome'),
      usuario: formData.get('usuario'),
      perfil: parseInt(formData.get('perfil'))
    };

    const senha = formData.get('senha');
    if (senha) {
      usuarioData.senha = senha;
    }

    try {
      await api.updateUsuario(this.usuarioId, usuarioData);
      this.navigateBack();
    } catch (error) {
      console.error('Erro ao salvar usuario:', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível salvar as alterações. Tente novamente mais tarde.';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  navigateBack() {
    const router = document.querySelector('ion-router');
    router.push('/usuarios', 'root');
  }
}

customElements.define('update-usuario-page', UpdateUsuarioPage);
